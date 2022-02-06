import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IMyTvQShowEpisodeFlatV5, IMyTvQShowFlatV5 } from './flat-file-v5.model';
import { CommonService } from './common.service';
import { SettingService } from './setting.service';
import { UiEpisodeModel } from './ui.model';
import { WebDatabaseService } from './web-database.service';
import { IMyTvQDbEpisode } from './db.model';

@Injectable({ providedIn: 'root' })
export class EpisodeService {
    constructor(
        private commonSvc: CommonService,
        private settingSvc: SettingService,
        private datePipe: DatePipe,
        private webDb: WebDatabaseService
    ) {
    }

    public async saveAll(episodes: IMyTvQShowEpisodeFlatV5[]) {
        const list = episodes.map((e,i,a) => {
            const previousId = (i-1 >= 0) ? a[i-1].episode_id: '';
            const nextId = i+1 < a.length ? a[i+1].episode_id: '';
            const episode: IMyTvQDbEpisode = {
                episodeId: e.episode_id,
                showId: e.show_id,
                localShowTime: e.local_showtime,
                name: e.name,
                url: e.url,
                iso8601: e.iso8601,
                runtime: e.runtime,
                season: e.season,
                number: e.number ,
                counter: e.counter,
                special: e.special,
                summary: e.summary,
                poster: e.image?.poster && e.image?.poster.length  ? e.image?.poster[0] : '',
                seen: e.seen,
                previousId: previousId,
                nextId: nextId,
                apiSource: e.api_source,
                apiId: e.api_id
            };
            return episode;
        });
        await this.webDb.putList('episodes', list);
    }

    getEpisodeModel(show: IMyTvQShowFlatV5, episodeId: string) {
        const episode = this.getEpisode(show, episodeId);
        if (!episode) {
            throw (new Error('Episode was not found'));
        }

        const model = new UiEpisodeModel(episode);
        const offset = this.settingSvc.getTimezoneOffset(show.channel.country.code);
        model.setFormattedDate(offset, this.datePipe);
        return model;
    }

    // createEpisodeId(episode: IMyTvQShowEpisodeFlatV5): string {
    //     if (episode.special) {
    //         return `${episode.show_id}_${this.commonSvc.zeroPad(episode.counter, 4)}_${this.commonSvc.zeroPad(episode.season, 4)}_S${this.commonSvc.zeroPad(episode.number, 4)}`;
    //     } else {
    //         return `${episode.show_id}_${this.commonSvc.zeroPad(episode.counter, 4)}_${this.commonSvc.zeroPad(episode.season, 4)}_${this.commonSvc.zeroPad(episode.number, 4)}`;
    //     }
    // }

    getEpisodeName(episode?: IMyTvQShowEpisodeFlatV5): string {
        if (!!episode) {
            return episode.special ? `[Special ${episode.counter}] ${episode.name}` :
                `${episode.counter}.(${episode.season}x${episode.number}) ${episode.name}`;
        } else {
            return '';
        }
    }

    getNextEpisodeDays(episode?: IMyTvQShowEpisodeFlatV5): string {
        if (!episode) {
            return 'TBA';
        }
        return this.commonSvc.getDaysBetweenToEnglish(new Date(), new Date(episode.local_showtime));
    }

    getFormattedTime(localShowtime: number, status: number): string {
        switch (status) {
            case 0:
                return this.datePipe.transform(localShowtime, 'EEE h:mm a, MMM d, y') || 'n/a';
            case -1:
            case 1:
            default:
                return this.datePipe.transform(localShowtime, 'MMM d, y') || 'n/a';
        }
    }

    getFormattedDate(episode: IMyTvQShowEpisodeFlatV5): string {
        return this.datePipe.transform(episode.local_showtime, '(MMM d, y)') || '(n/a)';
    }

    /**
     *
     * @param showId
     * @returns IShowImportantEpisodes
     */
    getImportantEpisodes(show: IMyTvQShowFlatV5) {
        let next;
        for (const episodeId in show.episode_list) {
            if (Object.prototype.hasOwnProperty.call(show.episode_list, episodeId)) {
                const episode = show.episode_list[episodeId];
                if (!next && !episode.seen) {
                    next = episode;
                }
            }
        }
        return {
            first: show?.first_episode,
            last: show?.last_episode,
            next,
            latest: show?.next_episode
        };
    }

    getEpisodeList(show: IMyTvQShowFlatV5): { [episodeId: string]: IMyTvQShowEpisodeFlatV5; } {
        return show.episode_list || {};
    }

    getEpisode(show: IMyTvQShowFlatV5, episodeId: string): IMyTvQShowEpisodeFlatV5 {
        const list = show.episode_list;
        return list[episodeId];
    }

    toggleSeen(show: IMyTvQShowFlatV5, episodeId: string, seen: boolean): void {
        const episode = this.getEpisode(show, episodeId);
        if (!!episode) {
            episode.seen = seen;
        }
    }
}
