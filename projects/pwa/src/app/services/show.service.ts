import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { SettingService } from "./setting.service";
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
        return await this.webDb.getAllAsArray<IMyTvQDbShow>('shows').then(showList => {
            if (this.settingSvc.showsOrder === 'showname') {
                // http://www.javascriptkit.com/javatutors/arraysort2.shtml
                if (showList.length) {
                    showList.sort((a, b) => {
                        const x = a.name.toLowerCase();
                        const y = b.name.toLowerCase();
                        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                    });
                }
            }
            else { // unseen or default airdate
                // get future shows
                const futureShowList = showList.filter((item) => {
                    return !!item.nextEpisode;
                });
                // sort by asc
                futureShowList.sort((a, b) => {
                    const x = a.nextEpisode?.localShowTime || 0;
                    const y = b.nextEpisode?.localShowTime || 0;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });

                // tba
                const tbaShowList = showList.filter((item) => {
                    return !(item.status || '').match(this.EndedRegex) && !item.nextEpisode;
                });

                // sort by desc
                tbaShowList.sort((a, b) => {
                    const x = (b.previousEpisode || b.lastEpisode || { local_showtime: 0 }).localShowTime || 0;
                    const y = (a.previousEpisode || a.lastEpisode || { local_showtime: 0 }).localShowTime || 0;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });

                // console.log(tba_show_list);
                // completed
                const endedShowList = showList.filter((item, index) => {
                    return (item.status || '').match(this.EndedRegex);
                });
                // sort by desc
                endedShowList.sort((a, b) => {
                    const x = (b.lastEpisode || { local_showtime: 0 }).localShowTime || 0;
                    const y = (a.lastEpisode || { local_showtime: 0 }).localShowTime || 0;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });

                const tbaEnded = tbaShowList.concat(endedShowList);

                let newShowList = futureShowList.concat(tbaEnded);

                if (this.settingSvc.showsOrder === 'unseen') {
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
                showList = newShowList;
            }

            if (this.settingSvc.hideTba) {
                showList = showList.filter(o => !!o && (o.unseenCount > 0 || !!o.nextEpisode));
            }
            return showList;
        });
    }

    public async saveFileToDb(showList: IMyTvQShowFlatV5[]) {
        const list = showList.map(e => {
            // IMyTvQDbShow
            const show = {
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
                unseenCount: e.unseen_count,
                totalEpisodes: e.total_episodes,
                totalSeasons: 0, // TODO:
                nextUpdateTime: e.next_update_time,
                schedule: e.schedule,
                userRating:e.user_rating,
                status: e.status,
                channel: {name: e.channel.name, country: e.channel.country},
                image: e.image,
                apiSource: e.api_source,
                apiId: e.api_id
            } as IMyTvQDbShow;
            return show;
        });
        await this.webDb.putList('shows', list);
    }

    async getShowModel(showId: string) {
        // this.webDb
        const show = await this.getShow(showId);

        // const latestEpisode = show.nextEpisode || show.lastEpisode!;
        // const episode = await this.episodeSvc.getEpisode(latestEpisode.episodeId);
        const status = this.getShowStatus(show);

        const model = new UiShowModel(show);
        model.status = status;
        // model.latestEpisodeName = this.episodeSvc.getEpisodeName(episode) || 'TBA';
        // model.latestEpisodeDateFormatted = this.episodeSvc.getFormattedTime(episode.localShowTime, status);
        // model.latestEpisodeIn = this.episodeSvc.getNextEpisodeDays(episode);

        return model;
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
        const episode = show.nextEpisode || show.lastEpisode;

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
        await this.episodeSvc.toggleSeen(nextEpisodeId, true);

        if (show.unseenCount > 0) {
            show.unseenCount = show.unseenCount - 1;
            await this.webDb.putObj('shows',show);
        }
    }
}
