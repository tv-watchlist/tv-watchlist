import { Injectable } from '@angular/core';
import { IMyTvQShowFlatV5, IMyTvQShowEpisodeFlatV5 } from './flat-file-v5.model';
import { CommonService } from './common.service';
import { SettingService } from "./setting.service";
import { IShowImportantEpisodes, UiShowModel } from './ui.model';
import { EpisodeService } from './episode.service';
import { IMyTvQDbShow } from './db.model';
import { WebDatabaseService } from './web-database.service';

@Injectable({ providedIn: 'root' })
export class ShowService {
    constructor(
        private settingSvc: SettingService,
        private episodeSvc: EpisodeService,
        private webDb: WebDatabaseService,
        private commonSvc: CommonService
    ) { }

    private EndedRegex = /Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i;

    shows: Map<string, IMyTvQShowFlatV5> = new Map();
    showIdOrder: string[] = [];

    initShowList(showsOrder: string, showList: IMyTvQShowFlatV5[]): void {
        showList.forEach(o => {
            this.shows.set(o.show_id, o);
        });
        if (showsOrder === 'showname') {
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
                return !!item.next_episode;
            });
            // sort by asc
            futureShowList.sort((a, b) => {
                const x = a.next_episode.local_showtime;
                const y = b.next_episode.local_showtime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            // tba
            const tbaShowList = showList.filter((item) => {
                return !(item.status || '').match(this.EndedRegex) && !item.next_episode;
            });

            // sort by desc
            tbaShowList.sort((a, b) => {
                const x = (b.previous_episode || b.last_episode || { local_showtime: null }).local_showtime;
                const y = (a.previous_episode || a.last_episode || { local_showtime: null }).local_showtime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            // console.log(tba_show_list);
            // completed
            const endedShowList = showList.filter((item, index) => {
                return (item.status || '').match(this.EndedRegex);
            });
            // sort by desc
            endedShowList.sort((a, b) => {
                const x = (b.last_episode || { local_showtime: null }).local_showtime;
                const y = (a.last_episode || { local_showtime: null }).local_showtime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            const tbaEnded = tbaShowList.concat(endedShowList);

            let newShowList = futureShowList.concat(tbaEnded);

            if (showsOrder === 'unseen') {
                const showListUnseen = newShowList.filter((item) => {
                    return item.unseen_count > 0;
                });
                const showListSeen = newShowList.filter((item) => {
                    return item.unseen_count === 0;
                });
                showListUnseen.sort((a, b) => {
                    const x = b.unseen_count;
                    const y = a.unseen_count;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
                newShowList = showListUnseen.concat(showListSeen);
            }
            this.showIdOrder = newShowList.map(o => o.show_id);
        }

        if (this.settingSvc.hideTba) {
            this.showIdOrder = this.showIdOrder.map(o => this.shows.get(o))
                .filter(o => !!o && (o.unseen_count > 0 || !!o.next_episode))
                .map(o => (!!o && o.show_id) as string);
        }
    }

    public async saveAll(showList: IMyTvQShowFlatV5[]) {
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

    getShowModel(showId: string) {
        const show = this.getShow(showId);

        const latestEpisode = show.next_episode || show.last_episode;
        const episode = this.episodeSvc.getEpisode(show, latestEpisode.episode_id);
        const status = this.getShowStatus(show);
        const impEpisodes = this.episodeSvc.getImportantEpisodes(show);

        const model = new UiShowModel(show);
        model.status = status;
        model.latestEpisodeName = this.episodeSvc.getEpisodeName(episode) || 'TBA';
        model.latestEpisodeDateFormatted = this.episodeSvc.getFormattedTime(episode.local_showtime, status);
        model.latestEpisodeIn = this.episodeSvc.getNextEpisodeDays(episode);
        model.nextEpisodeName = this.episodeSvc.getEpisodeName(impEpisodes.next);

        return model;
    }

    getShow(showId: string): IMyTvQShowFlatV5 {
        return this.shows.get(showId)!;
    }

    getShowIdFromEpisode(episodeId: string): string {
        return episodeId.split('_')[0];
    }

    getShowByEpisodeId(episodeId: string): IMyTvQShowFlatV5 {
        const showId = episodeId.split('_')[0];
        return this.shows.get(showId)!;
    }

    getShowStatus(show: IMyTvQShowFlatV5): -1 | 0 | 1 {
        if ((show.status || '').match(this.EndedRegex)) {
            return -1; // Completed
        }
        const episode = show.next_episode || show.last_episode;

        // console.log(show, episode);
        const now = new Date().getTime();
        if (!!episode && !!episode.local_showtime && episode.local_showtime > now) {
            return 0; // Running
        }
        else {
            return 1; // TBA
        }
    }

    removeShow(showId: string): void {
        this.shows.delete(showId);
        this.showIdOrder.splice(this.showIdOrder.findIndex(o => o === showId), 1);
    }

    markAsSeen(show: IMyTvQShowFlatV5, nextEpisode: IMyTvQShowEpisodeFlatV5): void {
        nextEpisode.seen = true;

        if (show.unseen_count > 0) {
            show.unseen_count = show.unseen_count - 1;
        }
    }
}
