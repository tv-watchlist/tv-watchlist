import { Injectable } from '@angular/core';
import { SettingService } from './setting.service';
import { UiShowModel } from './ui.model';
import { EpisodeService } from './episode.service';
import { lastValueFrom, map, Observable, switchMap } from 'rxjs';
import { ApiTheMovieDbService } from '../api/api-the-movie-db.service';
import { ApiTvMazeService, ITvMazeShow, ITvMazeEpisode } from '../api/api-tv-maze.service';
import { IMyTvQDbShow, IMyTvQDbEpisode } from '../storage/db.model';
import { WebDatabaseService } from '../storage/web-database.service';
import { IMyTvQShowFlatV5 } from './flat-file-v5.model';
import { ToastService } from '../../widgets/toast/toast.service';
import { CommonService } from 'common';

@Injectable({ providedIn: 'root' })
export class ShowService {
    constructor(
        private settingSvc: SettingService,
        private episodeSvc: EpisodeService,
        private webDb: WebDatabaseService,
        private commonSvc: CommonService,
        private apiTvMazeSvc: ApiTvMazeService,
        private apiTmdbSvc: ApiTheMovieDbService,
        private toastSvc: ToastService,
    ) { }

    private EndedRegex = /Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i;

    public async getAll() {
        return await this.webDb.getAllAsArray<IMyTvQDbShow>('shows');
    }

    public async saveFileToDb(showList: IMyTvQShowFlatV5[]) {
        const list = showList.map(e => {
            // IMyTvQDbShow
            const show: IMyTvQDbShow = {
                showId: e.show_id,
                name: e.name,
                url: e.url,
                runtime: e.runtime,
                summary: e.summary,
                showType: e.show_type,
                language: e.language,
                genres: e.genres,
                cast: e.cast,
                premiered: e.premiered,
                schedule: e.schedule,
                userRating: e.user_rating,
                status: e.status,
                channel: { name: e.channel.name, country: e.channel.country },
                image: e.image,
                apiSource: e.api_source,
                apiId: e.api_id,

                updateTime: (e.next_update_time * 1000),
                lastWatchedTime: 0,
                currentEpisodeTime: 0,
                unseenCount: 0,
                totalEpisodes: 0,
                totalSeasons: 0,
                pastEpisode: undefined,
                futureEpisode: undefined,
                unseenEpisode: undefined,
            };
            return show;
        });
        await this.webDb.putList('shows', list);
    }

    public async saveAll(showList: IMyTvQDbShow[]) {
        return await this.webDb.putList('shows', showList);
    }

    public async save(show: IMyTvQDbShow) {
        await this.webDb.putObj('shows', show);
    }

    async getShowModel(showId: string) {
        // this.webDb
        const show = await this.getShow(showId);

        const latestEpisode = show.futureEpisode || show.pastEpisode;

        const model = new UiShowModel(show);
        model.status = this.getShowStatus(show);
        if (!!latestEpisode) {
            model.latestEpisodeId = latestEpisode.episodeId;
            model.latestEpisodeName = this.episodeSvc.getEpisodeName(latestEpisode) || 'TBA';
            model.latestEpisodeDateFormatted = this.episodeSvc.getFormattedTime(latestEpisode.localShowTime || 0, model.status);
            model.latestEpisodeInDays = this.episodeSvc.getNextEpisodeDays(latestEpisode);
        }
        model.unseenEpisodeId = show.unseenEpisode?.episodeId || '';
        model.unseenEpisodeName = this.episodeSvc.getEpisodeName(show.unseenEpisode);
        return model;
    }

    async updateAndSaveAllShowReference() {
        // unseen or default airdate
        const airdateSort = (showList: IMyTvQDbShow[])=> {
            // first show future episodes in asc order
            // then tba episodes in desc order
            // finally complete episodes in desc order

            // get future shows && sort by asc
            const futureShowList = showList.filter((item) => {
                return !!item.futureEpisode;
            });
            this.commonSvc.sort(futureShowList, 'currentEpisodeTime'); // futureEpisode?.localShowTime

            // tba && sort by desc
            const tbaShowList = showList.filter((item) => {
                return !(item.status || '').match(this.EndedRegex) && !item.futureEpisode;
            });
            this.commonSvc.sort(tbaShowList, '-currentEpisodeTime'); // -pastEpisode?.localShowTime

            // completed && sort by desc
            const endedShowList = showList.filter((item) => {
                return (item.status || '').match(this.EndedRegex);
            });
            this.commonSvc.sort(endedShowList, '-currentEpisodeTime'); // -pastEpisode.localShowTime

            const tbaEnded = tbaShowList.concat(endedShowList);

            return futureShowList.concat(tbaEnded);
        };

        console.log('Updating show references...starting!');
        let showList = await this.getAll();
        const settings = await this.settingSvc.getAll();
        showList.forEach(async show => {
            const episodes = await this.episodeSvc.getEpisodeList(show.showId);
            // update show episode ref
            this.updateShowReference(show, episodes);
            await this.webDb.putObj('shows', show);
        });

        if (settings.hideTba) {
            // only show with future or unseen episodes
            showList = showList.filter(o => !!o && (o.unseenCount > 0 || !!o.futureEpisode));
        }
        let newShowList: IMyTvQDbShow[] = [];
        let showIdOrder: string[] = [];

        if (settings.showsOrder === 'showname') {
            if (showList.length) {
                this.commonSvc.sort(showList, 'name');
            }
            newShowList = showList;
        }
        else if (settings.showsOrder === 'unseen') {
            // sort by unseenCount asc, lastWatchedTime and  currentEpisodeTime desc
            this.commonSvc.sort(showList, 'unseenCount', '-lastWatchedTime', '-currentEpisodeTime');
            newShowList = showList;
        } else if (settings.showsOrder === 'unseen_my_popular') {
            // 1st pref: 0 unseen episode and unaired within 1 week
            // 2nd pref: lastWatchedTime order by desc within 1 month
            // 3rd pref: normal airdate
            const first = showList.filter(o => o.unseenCount === 0 && !!o.futureEpisode &&
                this.commonSvc.getDaysBetween(new Date(), new Date(o.currentEpisodeTime)) <= 7);
            this.commonSvc.sort(first, 'currentEpisodeTime'); // currentEpisodeTime = futureEpisode.localShowTime
            const firstShowIds = first.map(o => o.showId);
            const second = showList.filter(o => !firstShowIds.includes(o.showId) && o.lastWatchedTime > 0 &&
            this.commonSvc.getDaysBetween(new Date(), new Date(o.currentEpisodeTime)) <= 30);
            // sort by lastWatchedTime if equal then currentEpisodeTime desc
            this.commonSvc.sort(second, '-lastWatchedTime', '-currentEpisodeTime');
            const secondShowIds = second.map(o => o.showId);
            const third = showList.filter(o => !firstShowIds.includes(o.showId) && !secondShowIds.includes(o.showId));
            newShowList = first.concat(second, airdateSort(third));
        } else {
            // unseen or default airdate
            newShowList = airdateSort(showList);
        }

        showIdOrder = newShowList.map(o => o.showId);

        await this.settingSvc.save('showIdOrderList', showIdOrder);
        console.log('Updating show references...complete!');
    }

    async saveShowReference(showId: string, merge: {
        /**
        * time when user marked an episode as seen
        */
        lastWatchedTime?: number;
    } = {}) {
        const show = await this.getShow(showId);
        if (merge.lastWatchedTime !== undefined) {
            show.lastWatchedTime = merge.lastWatchedTime;
        }
        const episodeList = await this.episodeSvc.getEpisodeList(showId);
        this.updateShowReference(show, episodeList);
        await this.webDb.putObj('shows', show);
    }

    updateShowReference(show: IMyTvQDbShow, episodeList: IMyTvQDbEpisode[]) {
        // console.log(show,episodeList);
        const now = (new Date()).getTime();
        let unseenCount = 0;
        show.futureEpisode = undefined;
        show.pastEpisode = undefined;
        show.unseenEpisode = undefined;

        episodeList.forEach((episode, index, array) => {
            if (!!episode.localShowTime && episode.localShowTime < now) {
                show.pastEpisode = episode;
            } else if (!show.futureEpisode && !!episode.localShowTime && episode.localShowTime >= now) {
                show.futureEpisode = episode;
            }

            if (!!episode.localShowTime && episode.localShowTime < now && !episode.seen) {
                unseenCount++;
                if (index === 0 || (index > 0 && array[index - 1].seen)) {
                    show.unseenEpisode = episode;
                }
            }
        });
        show.currentEpisodeTime = (show.futureEpisode || show.pastEpisode || { localShowTime: 0 }).localShowTime;
        show.totalSeasons = (show.futureEpisode || show.pastEpisode || { season: 0 }).season;
        show.totalEpisodes = episodeList.length;
        show.unseenCount = unseenCount;
    }

    async getShow(showId: string): Promise<IMyTvQDbShow> {
        return await this.webDb.getObj('shows', showId)!;
    }

    getShowIdFromEpisode(episodeId: string): string {
        return episodeId.split('_')[0];
    }

    async getShowByEpisodeId(episodeId: string): Promise<IMyTvQDbShow> {
        const showId = episodeId.split('_')[0];
        return await this.getShow(showId);
    }

    /**
     * -1 Completed
     * 0 Running
     * 1 TBA
     * @param show
     * @returns
     */
    getShowStatus(show: IMyTvQDbShow): -1 | 0 | 1 {
        if ((show.status || '').match(this.EndedRegex)) {
            return -1; // Completed
        }
        const episode = show.futureEpisode || show.pastEpisode;

        // console.log(show, episode);
        const now = new Date().getTime();
        if (!!episode && !!episode.localShowTime && episode.localShowTime > now) {
            return 0; // Running
        }
        else {
            return 1; // TBA
        }
    }

    removeShow(showId: string): void {
        this.webDb.deleteObj('shows', showId);
        this.webDb.deleteRange('episodes', 'showIdIndex', this.webDb.getKeyRange('=', showId));
        this.settingSvc.get<string[]>('showIdOrderList').then(showIdOrder => {
            showIdOrder.splice(showIdOrder.findIndex(o => o === showId), 1);
            this.settingSvc.save('showIdOrderList', showIdOrder);
        });
        // TODO: remove from other places too i.e. future storage like notification
    }

    async markAsSeen(show: IMyTvQDbShow, nextEpisodeId: string): Promise<void> {
        await this.episodeSvc.toggleSeen(nextEpisodeId, true); // marks episode seen
        const seenEpisode = await this.episodeSvc.getEpisode(nextEpisodeId);
        const nextUnseenEpisode = await this.episodeSvc.getEpisode(seenEpisode.nextId!);

        show.unseenEpisode = nextUnseenEpisode;

        if (show.unseenCount > 0) {
            show.unseenCount = show.unseenCount - 1;
        }
        show.lastWatchedTime = new Date().getTime();
        await this.webDb.putObj('shows', show);
    }

    async addUpdateTvMazeShow(apiType: string, apiId: any, updateTime?: number): Promise<void> {
        let tvMazeShowAndEpisode$: Observable<[ITvMazeShow, ITvMazeEpisode[]]>;
        if (apiType === 'tmdb') {
            // convert tmdb to tvmaze
            tvMazeShowAndEpisode$ = this.apiTmdbSvc.getExternal(apiId).pipe(
                switchMap(ext => this.apiTvMazeSvc.getByThetvdb(ext.tvdb_id)),
                map(([tvmShow, _image, tvmEpisodeList]) => {
                    tvmShow._embedded = { images: _image };
                    return [tvmShow, tvmEpisodeList];
                })
            );
        } else if (apiType === 'tvmaze') {
            tvMazeShowAndEpisode$ = this.apiTvMazeSvc.getShowAndEpisode(apiId);
        } else {
            throw new Error('API not recognized');
        }

        let tvmShow: ITvMazeShow;
        let tvmEpisodeList: ITvMazeEpisode[];
        try {
            const [_tvmShow, _tvmEpisodeList] = await lastValueFrom(tvMazeShowAndEpisode$);
            tvmShow = _tvmShow;
            tvmEpisodeList = _tvmEpisodeList;
        } catch (err) {
            this.toastSvc.error(`Something went wrong while fetching data from TvMaze API`);
            console.error('server rejected the request', err);
            return;
        }

        const showId = 'tvmaze' + tvmShow.id;
        const show = await this.getShow(showId) || {};
        const isAdding = !show.showId;

        // update existing show from web
        show.showId = showId;
        show.apiSource = 'tvmaze';
        show.apiId = show.apiId || {};
        show.apiId[apiType] = apiId;
        show.apiId.tvmaze = tvmShow.id;
        show.apiId.thetvdb = tvmShow.externals.thetvdb;
        show.apiId.imdb = tvmShow.externals.imdb;

        const channel = tvmShow.network || tvmShow.webChannel;
        if (!!channel) {
            show.channel = show.channel || {};
            show.channel.name = channel.name || '';
            if (!!channel.country) {
                show.channel.country = channel.country;
            }
        }

        show.name = tvmShow.name;
        show.url = tvmShow.url;
        show.showType = tvmShow.type;
        show.language = tvmShow.language;
        show.genres = tvmShow.genres;
        show.status = tvmShow.status; // (Running, Ended, To Be Determined, In Development)
        show.runtime = tvmShow.averageRuntime || tvmShow.runtime;
        show.premiered = tvmShow.premiered;
        show.summary = tvmShow.summary;
        show.schedule = tvmShow.schedule;
        show.userRating = show.userRating || {};
        show.userRating.average = tvmShow.rating.average;
        // show.userRating.count = tvmShow.rating.count;
        show.image = show.image || { poster: [], banner: [] };
        if (!!tvmShow.image?.original && !show.image.poster.includes(tvmShow.image.original)) {
            show.image.poster.push(tvmShow.image.original);
        }
        if (!!tvmShow._embedded?.images) {
            // add banner
            const banners = tvmShow._embedded?.images.filter(o => o.type === 'banner').map(o => o.resolutions.original.url);
            for (const banner of banners) {
                if (!show.image.banner.includes(banner)) {
                    show.image.banner.push(banner);
                }
            }
            // if not found then add background
            if (show.image.banner.length === 0) {
                const background = tvmShow._embedded?.images.find(o => o.type === 'background')?.resolutions.original.url
                if (!!background) {
                    show.image.banner.push(background);
                }
            }
        }

        show.updateTime = updateTime || new Date().getTime();
        // set episodes
        // first lets re-sort the order which have correct data
        const knownEpisodeList = tvmEpisodeList.filter(e => !!e.airstamp);
        let unknownEpisodeList = tvmEpisodeList.filter(e => !e.airstamp);

        knownEpisodeList.sort((x, y) => {
            var x1 = x.airstamp + '_' + this.commonSvc.zeroPad(x.season, 4) + '_' + this.commonSvc.zeroPad(x.number || 0, 4);
            var y1 = y.airstamp + '_' + this.commonSvc.zeroPad(y.season, 4) + '_' + this.commonSvc.zeroPad(y.number || 0, 4);
            return this.commonSvc.sortAscending(x1, y1);
        });
        let initSeason = knownEpisodeList.length > 0 ? knownEpisodeList[0].season : 1;
        let cleanEpisodeList: ITvMazeEpisode[] = [];
        knownEpisodeList.forEach((episode) => {
            if (episode.season != initSeason) {
                cleanEpisodeList = cleanEpisodeList.concat(
                    unknownEpisodeList.filter(item => item.season === initSeason)
                );
                unknownEpisodeList = unknownEpisodeList.filter(item => item.season !== initSeason)
                initSeason = episode.season;
            }
            cleanEpisodeList.push(episode);
        });
        cleanEpisodeList = cleanEpisodeList.concat(unknownEpisodeList);

        let normal_counter = 0;
        let special_counter = 0;
        let last_number = 0;
        let newEpisodeList: IMyTvQDbEpisode[] = [];
        cleanEpisodeList.forEach(_episode => {
            // init episode
            const episode: IMyTvQDbEpisode = {
                showId: showId,
                episodeId: '',
                localShowTime: _episode.airstamp ? Date.parse(_episode.airstamp) : undefined,
                name: _episode.name,
                url: _episode.url,
                iso8601: _episode.airstamp,
                runtime: _episode.runtime,
                season: _episode.season,
                number: _episode.number,
                summary: _episode.summary,
                apiSource: apiType,
                apiId: { tvmaze: _episode.id },
                poster: !!_episode.image ? _episode.image.original : undefined,
                counter: 0,
                nextId: undefined,
                previousId: undefined,
                seen: false,
                special: false
            };
            // set episodeId
            if (_episode.number != null) {
                last_number = _episode.number;
                episode.special = false;
                episode.counter = ++normal_counter;
                episode.episodeId = this.episodeSvc.createEpisodeId(showId, episode.season, last_number, normal_counter);
            } else {
                episode.special = true;
                episode.counter = ++special_counter;
                episode.episodeId = this.episodeSvc.createEpisodeId(showId, episode.season, last_number, normal_counter, special_counter);
            }
            newEpisodeList.push(episode);
        });

        // set show references
        const episodeDict = await this.episodeSvc.getEpisodeDictionary(showId) || {};
        const now = (new Date()).getTime();
        let unseenCount = 0;
        show.futureEpisode = undefined;
        show.pastEpisode = undefined;
        show.unseenEpisode = undefined;
        for (var i = 0; i < newEpisodeList.length; i++) {
            // set previousId
            if (i > 0) {
                newEpisodeList[i].previousId = newEpisodeList[i - 1].episodeId;
            }
            // set nextId
            if (i <= newEpisodeList.length - 2) {
                newEpisodeList[i].nextId = newEpisodeList[i + 1].episodeId;
            }
            // set seen
            if (!!episodeDict[newEpisodeList[i].episodeId]) {
                newEpisodeList[i].seen = episodeDict[newEpisodeList[i].episodeId].seen;
            } else {
                for (const key in episodeDict) {
                    if (Object.prototype.hasOwnProperty.call(episodeDict, key)) {
                        const oldEpisode = episodeDict[key];
                        if (oldEpisode.season === newEpisodeList[i].season &&
                            oldEpisode.number === newEpisodeList[i].number &&
                            oldEpisode.name.toLowerCase() === newEpisodeList[i].name.toLowerCase()) {
                            newEpisodeList[i].seen = oldEpisode.seen;
                            break;
                        }
                    }
                }
            }
            // set show properties pastEpisode, futureEpisode, unseenEpisode
            if (!!newEpisodeList[i].localShowTime && (newEpisodeList[i].localShowTime || 0) < now) {
                show.pastEpisode = newEpisodeList[i];
            } else if (!show.futureEpisode && !!newEpisodeList[i].localShowTime && (newEpisodeList[i].localShowTime || 0) >= now) {
                show.futureEpisode = newEpisodeList[i];
            }

            if (!!newEpisodeList[i].localShowTime && (newEpisodeList[i].localShowTime || 0) < now && !newEpisodeList[i].seen) {
                unseenCount++;
                if (i === 0 || (i > 0 && newEpisodeList[i - 1].seen)) {
                    show.unseenEpisode = newEpisodeList[i];
                }
            }
        }
        show.totalSeasons = (show.futureEpisode || show.pastEpisode || { season: 0 }).season;
        show.totalEpisodes = newEpisodeList.length;
        show.unseenCount = unseenCount;

        try {
            await this.webDb.putObj('shows', show);
            await this.webDb.deleteRange('episodes', 'showIdIndex', this.webDb.getKeyRange('=', showId));
            await this.webDb.putList('episodes', newEpisodeList);
            console.log('addUpdateShow', tvmShow.name, (!isAdding ? 'Updating' : 'Adding'));
            this.toastSvc.success(`Show '${show.name}' ${(!isAdding ? 'updated in' : 'added to')} your TvWatchList!`);
        } catch (error) {
            this.toastSvc.error(`Something went wrong while saving Show '${show.name || apiId}'`)
            console.error('server rejected the request', error);
        }
    }

    async smartUpdateAllShows() {
        const smartUpdateTime = await this.settingSvc.get<number>('updateTime');
        const now = new Date();
        const days = this.commonSvc.getDaysBetween(new Date(smartUpdateTime), now);
        const smartUpdateFrequency = 1;
        console.log('smartUpdateAllShows', days + ' days since last smart update...');

        if (days < smartUpdateFrequency) {
            console.log('smartUpdateAllShows', 'its not time to do smartUpdate yet');
            return false;
        }
        let since: 'all' | 'day' | 'week' | 'month' = 'all';
        // if(days <= 1) {
        //     since = 'day'
        // }
        // if(days <= 7 && days > 1) {
        //     since = 'week'
        // }
        // if(days <= 30 && days > 7) {
        //     since = 'month'
        // }
        const update = await lastValueFrom(this.apiTvMazeSvc.getUpdates(since));
        let showList = (await this.webDb.getIndexedList('shows', 'updateTimeIndex', this.webDb.getKeyRange('<', smartUpdateTime))) as IMyTvQDbShow[];
        showList.forEach(async show => {
            const apiId = show.apiId[show.apiSource] as number;
            const jsTime = ((update[apiId] || 0) * 1000);
            const showUpdateTime = show.updateTime || 0;
            if (!!update[apiId] && jsTime > showUpdateTime) {
                if (show.apiSource === 'tvmaze') {
                    await this.addUpdateTvMazeShow(show.apiSource, show.apiId[show.apiSource] as string, jsTime);
                } else {
                    console.log(show.apiSource + ' Not supported yet!');
                }
            }
            if (!update[apiId]) {
                console.log('smartUpdateAllShows', apiId, show.name, new Date(showUpdateTime), 'NOT in API-Update list');
            } else {
                console.log('smartUpdateAllShows', apiId, show.name, new Date(showUpdateTime), (jsTime > showUpdateTime ? 'UPDATED' : 'SKIPPED'), new Date(jsTime))
            }
        });
        await this.settingSvc.save('updateTime', now.getTime());
        return true;
    }
}
