import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IMyTvQShowEpisodeFlatV5 } from './flat-file-v5.model';
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

    public async saveFileToDb(episodes: IMyTvQShowEpisodeFlatV5[]) {
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

    async getEpisodeModel(episodeId: string, countryCode: string) {
        const episode = await this.getEpisode(episodeId);
        if (!episode) {
            throw (new Error('Episode was not found'));
        }

        const model = new UiEpisodeModel(episode);
        const offset = this.settingSvc.getTimezoneOffset(countryCode);
        model.setFormattedDate(offset, this.datePipe);
        return model;
    }

    getEpisodeName(episode?: IMyTvQDbEpisode): string {
        if (!!episode) {
            return episode.special ? `[Special ${episode.counter}] ${episode.name}` :
                `${episode.counter}.(${episode.season}x${episode.number}) ${episode.name}`;
        } else {
            return '';
        }
    }

    getNextEpisodeDays(episode?: IMyTvQDbEpisode): string {
        if (!episode) {
            return 'TBA';
        }
        return this.commonSvc.getDaysBetweenToEnglish(new Date(), new Date(episode.localShowTime));
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

    getFormattedDate(episode: IMyTvQDbEpisode): string {
        return this.datePipe.transform(episode.localShowTime, '(MMM d, y)') || '(n/a)';
    }

    async getEpisodeDictionary(showId: string): Promise<{[episodeId: string]: IMyTvQDbEpisode}> {
        return await this.webDb.getAllAsObject('episodes');
    }

    async getEpisode(episodeId: string): Promise<IMyTvQDbEpisode> {
        return await this.webDb.getObj('episodes',episodeId);
    }

    async toggleSeen(episodeId: string, seen: boolean): Promise<void> {
        const episode = await this.getEpisode(episodeId);
        if (!!episode) {
            episode.seen = seen;
            await this.webDb.putObj('episodes',episode);
        }
    }

    async toggleBulkSeen(episodeIds: string[], seen: boolean): Promise<void> {
        const ids = episodeIds.filter(o=>o).sort();
        const list = await this.webDb.getAllAsArray<IMyTvQDbEpisode>('episodes',this.webDb.getKeyRange(">= && <=",ids[1], ids[ids.length - 1]));
        for (const episode of list) {
            if(episodeIds.includes(episode.episodeId)){
                episode.seen = seen;
            }
        }
        await this.webDb.putList('episodes',list);
    }
}
