import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
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
        private webDb: WebDatabaseService,
    ) {
        this.now = new Date().getTime();
    }

    now: number;

    public async import(fileContent: string): Promise<void> {
        console.log('fileContent', fileContent);
        const model = JSON.parse(fileContent) as IMyTvQFlatV5;
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
                    if(episode.number != null){
                        last_number = episode.number;
                        episode.special = false;
                        episode.counter = ++normal_counter;
                        episode.episode_id = this.episodeSvc.createEpisodeId(episode);
                    }else{
                        episode.special = true;
                        episode.counter = ++special_counter;
                        episode.episode_id = this.episodeSvc.createEpisodeId(episode);
                    }
                    episode_list.push(episode);
                }
            }
        });
        await this.episodeSvc.saveAll(episode_list);
        // nsr.myTvQ.subscribed.SaveShow(show, function(show_status){
        //     nsr.myTvQ.subscribed.SaveEpisodeList(episode_list, function(episode_status){
        //         processed++;
        //         if (processed == show_list.length && callback) {
        //             nsr.myTvQ.subscribed.UpdateAllShowReference();
        //             callback(processed);
        //         }
        //         nsr.myTvQ.notify.AddShowNotifications(show, episode_list, function(cnt){
        //             console.log('AddNotifications Added', cnt);
        //         });
        //     });
        // });
    }

    export(): string {
        return '';
    }
}
