import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { SettingService } from './setting.service';
import { UiShowModel } from './ui.model';
import { EpisodeService } from './episode.service';
import { IMyTvQDbEpisode, IMyTvQDbShow } from './db.model';
import { WebDatabaseService } from './web-database.service';
import { IMyTvQShowFlatV5 } from './flat-file-v5.model';

@Injectable({ providedIn: 'root' })
export class ShowService {
    constructor(
        private settingSvc: SettingService,
        private episodeSvc: EpisodeService,
        private webDb: WebDatabaseService,
        private commonSvc: CommonService
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
                contentRating: e.content_rating,
                premiered: e.premiered,
                nextUpdateTime: e.next_update_time,
                schedule: e.schedule,
                userRating: e.user_rating,
                status: e.status,
                channel: { name: e.channel.name, country: e.channel.country },
                image: e.image,
                apiSource: e.api_source,
                apiId: e.api_id,

                lastWatchedTime: 0,
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
            model.latestEpisodeName = this.episodeSvc.getEpisodeName(latestEpisode) || 'TBA';
            model.latestEpisodeDateFormatted = this.episodeSvc.getFormattedTime(latestEpisode.localShowTime, model.status);
            model.latestEpisodeInDays = this.episodeSvc.getNextEpisodeDays(latestEpisode);
        }
        model.unseenEpisodeName = this.episodeSvc.getEpisodeName(show.unseenEpisode);
        return model;
    }

    async updateAllShowReference() {
        console.log('Updating show references...starting!');
        let showList = await this.getAll();
        const settings = await this.settingSvc.getAll();
        showList.forEach(async show => {
            const episodes = await this.episodeSvc.getEpisodeList(show.showId);
            // update show episode ref
            this.updateReference(show, episodes);
            await this.webDb.putObj('shows', show);
        });

        if (settings.hideTba) {
            showList = showList.filter(o => !!o && (o.unseenCount > 0 || !!o.futureEpisode));
        }

        let showIdOrder: string[] = [];
        if (settings.showsOrder === 'showname') {
            // http://www.javascriptkit.com/javatutors/arraysort2.shtml
            if (showList.length) {
                this.commonSvc.sort(showList, 'name');
                // showList.sort((a, b) => {
                //     const x = a.name.toLowerCase();
                //     const y = b.name.toLowerCase();
                //     return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                // });
            }
        }
        else {
            // unseen or default airdate

            // get future shows && sort by asc
            const futureShowList = showList.filter((item) => {
                return !!item.futureEpisode;
            });
            this.commonSvc.sort(futureShowList, '-futureEpisode');
            // .sort((a, b) => {
            //     const x = a.futureEpisode?.localShowTime || 0;
            //     const y = b.futureEpisode?.localShowTime || 0;
            //     return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            // });

            // tba && sort by desc
            const tbaShowList = showList.filter((item) => {
                return !(item.status || '').match(this.EndedRegex) && !item.futureEpisode;
            });
            this.commonSvc.sort(tbaShowList, '-pastEpisode');
            // .sort((a, b) => {
            //     const x = b.pastEpisode?.localShowTime || 0;
            //     const y = a.pastEpisode?.localShowTime || 0;
            //     return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            // });

            // console.log(tba_show_list);
            // completed && sort by desc
            const endedShowList = showList.filter((item, index) => {
                return (item.status || '').match(this.EndedRegex);
            });
            this.commonSvc.sort(endedShowList, '-pastEpisode');
            // .sort((a, b) => {
            //     const x = b.pastEpisode?.localShowTime || 0;
            //     const y = a.pastEpisode?.localShowTime || 0;
            //     return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            // });

            const tbaEnded = tbaShowList.concat(endedShowList);

            let newShowList = futureShowList.concat(tbaEnded);

            // Acecool - Add a new type of sorting...
            // Note: Popular means it is either a NEW show with 0 aired, or you've seen ALL of the aired episodes meaning this will
            // put the show at the very top of the list if 0 unseen and x hours before airtime...
            // and at air-time, it'll be removed from the very top and it'll be at the very top anyway because it'll have 1 unseen episode...
            // Acecool - Sort Ascending - ie the fewest episodes left to watch appear at the top because these are shows you pay more attention
            // to or have gotten around to watching vs other shows with hundreds of episodes you haven't started with yet...
            // Acecool
            // - ensure upcoming shows
            // - which have been fully-watched to 0 eps un-seen except unaired
            // - are added to the unseen list. Shows with an air-date less than 24 hours from the current timestamp are added to the top of the list!
            if (settings.showsOrder === 'unseen_my_popular') {
                // TODO:
            }

            if (settings.showsOrder === 'unseen') {
                const showListUnseen = newShowList.filter(show => {
                    return show.unseenCount > 0;
                }).sort((a, b) => {
                    const x = b.unseenCount;
                    const y = a.unseenCount;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });

                const showListSeen = newShowList.filter(show => {
                    return show.unseenCount === 0;
                });
                newShowList = showListUnseen.concat(showListSeen);
            }
            showIdOrder = newShowList.map(o => o.showId);
        }

        this.settingSvc.save('showIdOrderList', showIdOrder);
        console.log('Updating show references...complete!');
    }

    async updateShowReference(showId: string, merge: {
        /**
        * time to refresh data from web (next fetch date)
        */
        nextUpdateTime?: number;
        /**
        * time when user marked an episode as seen
        */
        lastWatchedTime?: number;
    } = {}) {
        const show = await this.getShow(showId);
        if (merge.lastWatchedTime !== undefined) {
            show.lastWatchedTime = merge.lastWatchedTime;
        }
        if (merge.nextUpdateTime !== undefined) {
            show.nextUpdateTime = merge.nextUpdateTime;
        }
        const episodeList = await this.episodeSvc.getEpisodeList(showId);
        this.updateReference(show, episodeList);
        await this.webDb.putObj('shows', show);
    }

    updateReference(show: IMyTvQDbShow, episodeList: IMyTvQDbEpisode[]) {
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
        // TODO: remove from other places too
    }

    async markAsSeen(show: IMyTvQDbShow, nextEpisodeId: string): Promise<void> {
        await this.episodeSvc.toggleSeen(nextEpisodeId, true); // marks episode seen
        const seenEpisode = await this.episodeSvc.getEpisode(nextEpisodeId);
        const nextUnseenEpisode = await this.episodeSvc.getEpisode(seenEpisode.nextId);

        show.unseenEpisode = nextUnseenEpisode;

        if (show.unseenCount > 0) {
            show.unseenCount = show.unseenCount - 1;
        }
        show.lastWatchedTime = new Date().getTime();
        await this.webDb.putObj('shows', show);
    }
}
