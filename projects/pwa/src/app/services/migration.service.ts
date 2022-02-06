import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CommonService } from "./common.service";
import { EpisodeService } from "./episode.service";
import { IMyTvQFlatV5, IMyTvQShowEpisodeFlatV5 } from "./flat-file-v5.model";
import { SettingService } from "./setting.service";
import { ShowService } from "./show.service";
import { WebDatabaseService } from "./web-database.service";

@Injectable({ providedIn: 'root' })
export class MigrationService {
    constructor(
        private settingSvc: SettingService,
        private episodeSvc: EpisodeService,
        private showSvc: ShowService,
        private http: HttpClient,
        private commonSvc: CommonService,
        private webDb: WebDatabaseService,
    ) {
        this.now = new Date().getTime();
    }

    now: number;

    public async import(model: IMyTvQFlatV5): Promise<void> {
        console.log('fileContent', model);
        if(!('data_structure_version' in model)) {
            throw new Error('file content does not contain TV Watchlist backup.');
        }

        await this.webDb.clearAllStores();
        await this.settingSvc.saveAll(model.settings);
        const episode_list: IMyTvQShowEpisodeFlatV5[] = [];
        model.show_list.forEach(show => {
            const episode_listObj = show.episode_list; // obj
            let normal_counter = 0;
            let special_counter = 0;
            let last_number = 0;
            for (const key in episode_listObj) {
                if (Object.prototype.hasOwnProperty.call(episode_listObj, key)) {
                    const episode = episode_listObj[key];
                    if(!!episode.number){
                        last_number = episode.number;
                        episode.special = false;
                        episode.counter = ++normal_counter;
                        episode.episode_id = this.createEpisodeId(show.show_id, episode.season, last_number, normal_counter);
                    }else{
                        episode.number = last_number;
                        episode.special = true;
                        episode.counter = ++special_counter;
                        // use previous normal_counter and last_number
                        episode.episode_id = this.createEpisodeId(show.show_id, episode.season, last_number, normal_counter, special_counter);
                    }
                    episode_list.push(episode);
                }
            }
        });
        await this.showSvc.saveAll(model.show_list);
        await this.episodeSvc.saveAll(episode_list);
        //  nsr.myTvQ.subscribed.UpdateAllShowReference();
        // nsr.myTvQ.notify.AddShowNotifications(show, episode_list)
    }

    createEpisodeId(showId: string, season: number, epNumber: number, epCounter:number, splCounter?:number): string {
        if (splCounter) {
            return `${showId}_S${this.commonSvc.zeroPad(season, 3)}_E${this.commonSvc.zeroPad(epNumber, 3)}_C${this.commonSvc.zeroPad(epCounter, 4)}_X${this.commonSvc.zeroPad(splCounter, 3)}`;
        } else {
            return `${showId}_S${this.commonSvc.zeroPad(season, 3)}_E${this.commonSvc.zeroPad(epNumber, 3)}_C${this.commonSvc.zeroPad(epCounter, 4)}`;
        }
    }

    export(): string {
        return '';
    }
}
