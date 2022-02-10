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

    createEpisodeId(showId: string, season: number, epNumber: number, epCounter:number, splCounter?:number): string {
        if (splCounter) {
            return `${showId}_S${this.commonSvc.zeroPad(season, 3)}_E${this.commonSvc.zeroPad(epNumber, 3)}_C${this.commonSvc.zeroPad(epCounter, 4)}_X${this.commonSvc.zeroPad(splCounter, 3)}`;
        } else {
            return `${showId}_S${this.commonSvc.zeroPad(season, 3)}_E${this.commonSvc.zeroPad(epNumber, 3)}_C${this.commonSvc.zeroPad(epCounter, 4)}`;
        }
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
        return this.commonSvc.getDaysBetweenToEnglish(new Date(), new Date(episode.localShowTime||0));
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

    public async getEpisodeModel(episodeId: string, countryCode: string) {
        const episode = await this.getEpisode(episodeId);
        if (!episode) {
            throw (new Error('Episode was not found'));
        }

        const model = new UiEpisodeModel(episode);
        const offset = await this.settingSvc.getTimezoneOffset(countryCode);
        model.setFormattedDate(offset, this.datePipe);
        return model;
    }

    public async getEpisodeDictionary(showId: string): Promise<{[episodeId: string]: IMyTvQDbEpisode}> {
       return await this.webDb.getIndexedObject<'episodes', IMyTvQDbEpisode>('episodes','showIdIndex',this.webDb.getKeyRange('=',showId));
    }

    public async getEpisodeList(showId: string): Promise<IMyTvQDbEpisode[]> {
        return await this.webDb.getIndexedList<'episodes', IMyTvQDbEpisode>('episodes','showIdIndex',this.webDb.getKeyRange('=',showId));
    }

    public async getEpisode(episodeId: string): Promise<IMyTvQDbEpisode> {
        return await this.webDb.getObj('episodes',episodeId);
    }

    public async toggleSeen(episodeId: string, seen: boolean): Promise<void> {
       await this.toggleBulkSeen([episodeId], seen);
    }

    public async toggleBulkSeen(episodeIds: string[], seen: boolean): Promise<void> {
        if(episodeIds.length === 0) {
            // nothing todo
            console.warn('empty list, doing nothing');
        } else if (episodeIds.length ===1) {
            const episode = await this.getEpisode(episodeIds[0]);
            if (!!episode) {
                episode.seen = seen;
                await this.webDb.putObj('episodes',episode);
            }
        }
        else {
            const ids = episodeIds.filter(o=>o).sort();
            const list = await this.webDb.getAllAsArray<IMyTvQDbEpisode>('episodes',this.webDb.getKeyRange('>= && <=',ids[0], ids[ids.length - 1]));
            for (const episode of list) {
                if(episodeIds.includes(episode.episodeId)){
                    episode.seen = seen;
                }
            }
            await this.webDb.putList('episodes',list);
        }
    }

    public async saveFileToDb(episodes: { [episodeId: string]: IMyTvQShowEpisodeFlatV5 }) {
        let normal_counter = 0;
        let special_counter = 0;
        let last_number = 0;
        const episode_list = [];
        for (const key in episodes) {
            if (Object.prototype.hasOwnProperty.call(episodes, key)) {
                const episode = episodes[key];
                if(!!episode.number){
                    last_number = episode.number;
                    episode.special = false;
                    episode.counter = ++normal_counter;
                    episode.episode_id = this.createEpisodeId(episode.show_id, episode.season, last_number, normal_counter);
                }else{
                    episode.number = last_number;
                    episode.special = true;
                    episode.counter = ++special_counter;
                    // use previous normal_counter and last_number
                    episode.episode_id = this.createEpisodeId(episode.show_id, episode.season, last_number, normal_counter, special_counter);
                }
                episode_list.push(episode);
            }
        }
        const list = episode_list.map((e,i,a) => {
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
                poster: (!!e.image?.poster && Array.isArray(e.image?.poster) ? e.image?.poster[0] : e.image?.poster as string) ||'',
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
}
