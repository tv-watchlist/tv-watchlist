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
                contentRating:e.content_rating,
                premiered: e.premiered,
                nextUpdateTime: e.next_update_time,
                schedule: e.schedule,
                userRating:e.user_rating,
                status: e.status,
                channel: {name: e.channel.name, country: e.channel.country},
                image: e.image,
                apiSource: e.api_source,
                apiId: e.api_id,

                unseenCount: 0,
                totalEpisodes: 0,
                totalSeasons: 0,
                pastEpisode: undefined,
                futureEpisode: undefined,
            };
            return show;
        });
        await this.webDb.putList('shows', list);
    }

    async getShowModel(showId: string) {
        // this.webDb
        const show = await this.getShow(showId);

        const latestEpisode = show.futureEpisode || show.pastEpisode;

        const model = new UiShowModel(show);
        model.status = this.getShowStatus(show);
        if(!!latestEpisode) {
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
        showList.forEach(async show => {
            const episodes = await this.episodeSvc.getEpisodeList(show.showId);
            // update show episode ref
            this.updateShowReference(show, episodes);
            await this.webDb.putObj('shows', show);
        });

        if (await this.settingSvc.get('hideTba')) {
            showList = showList.filter(o => !!o && (o.unseenCount > 0 || !!o.futureEpisode));
        }

        let showIdOrder: string[] = [];
        if (await this.settingSvc.get('showsOrder') === 'showname') {
            // http://www.javascriptkit.com/javatutors/arraysort2.shtml
            if (showList.length) {
                showList.sort((a, b) => {
                    const x = a.name.toLowerCase();
                    const y = b.name.toLowerCase();
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }
        }
        else {
            // unseen or default airdate

            // get future shows && sort by asc
            const futureShowList = showList.filter((item) => {
                return !!item.futureEpisode;
            }).sort((a, b) => {
                const x = a.futureEpisode?.localShowTime || 0;
                const y = b.futureEpisode?.localShowTime || 0;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            // tba && sort by desc
            const tbaShowList = showList.filter((item) => {
                return !(item.status || '').match(this.EndedRegex) && !item.futureEpisode;
            }).sort((a, b) => {
                const x = (b.pastEpisode || { localShowTime: 0 }).localShowTime;
                const y = (a.pastEpisode || { localShowTime: 0 }).localShowTime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            // console.log(tba_show_list);
            // completed && sort by desc
            const endedShowList = showList.filter((item, index) => {
                return (item.status || '').match(this.EndedRegex);
            }).sort((a, b) => {
                const x = (b.pastEpisode || { latestEpisode: 0 }).localShowTime || 0;
                const y = (a.pastEpisode || { latestEpisode: 0 }).localShowTime || 0;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            const tbaEnded = tbaShowList.concat(endedShowList);

            let newShowList = futureShowList.concat(tbaEnded);

            if (await this.settingSvc.get('showsOrder') === 'unseen') {
                const showListUnseen = newShowList.filter((item) => {
                    return item.unseenCount > 0;
                });
                const showListSeen = newShowList.filter((item) => {
                    return item.unseenCount === 0;
                });
                showListUnseen.sort((a, b) => {
                    const x = b.unseenCount;
                    const y = a.unseenCount;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
                newShowList = showListUnseen.concat(showListSeen);
            }
            showIdOrder = newShowList.map(o => o.showId);
        }

        this.settingSvc.save('showIdOrderList', showIdOrder);
        console.log('Updating show references...complete!');
    }

    updateShowReference(show: IMyTvQDbShow, episodeList:IMyTvQDbEpisode[]) {
        // console.log(show,episodeList);
        const now = (new Date()).getTime();
        let unseenCount = 0;
        show.futureEpisode = undefined;
        show.pastEpisode = undefined;
        show.unseenEpisode = undefined;

        episodeList.forEach((episode,index,array) => {
            if (index === 0 || (index > 0 && array[index - 1].seen && !episode.seen)) {
                show.unseenEpisode = episode;
            }
            if (!!episode.localShowTime && episode.localShowTime < now) {
                show.pastEpisode = episode;
            } else  if (!show.futureEpisode && !!episode.localShowTime && episode.localShowTime >= now) {
                show.futureEpisode = episode;
            }

            if (!!episode.localShowTime && episode.localShowTime < now && !episode.seen) {
                unseenCount++;
            }
        });
        show.totalSeasons = (show.futureEpisode || show.pastEpisode || {season:0}).season;
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
        this.webDb.deleteObj('shows',showId);
        this.webDb.deleteRange('episodes','showIdIndex',this.webDb.getKeyRange('=',showId));
        // this.showIdOrder.splice(this.showIdOrder.findIndex(o => o === showId), 1);
    }

    async markAsSeen(show: IMyTvQDbShow, nextEpisodeId: string): Promise<void> {
        await this.episodeSvc.toggleSeen(nextEpisodeId, true); // marks episode seen
        const seenEpisode = await this.episodeSvc.getEpisode(nextEpisodeId);
        const nextUnseenEpisode = await this.episodeSvc.getEpisode(seenEpisode.nextId);

        show.unseenEpisode = nextUnseenEpisode;

        if (show.unseenCount > 0) {
            show.unseenCount = show.unseenCount - 1;
        }
        await this.webDb.putObj('shows',show);
    }
}
