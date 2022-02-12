import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebDatabaseService } from '../storage/web-database.service';
import { EpisodeService } from './episode.service';
import { IMyTvQFlatV5, IMyTvQShowEpisodeFlatV5 } from './flat-file-v5.model';
import { SettingService } from './setting.service';
import { ShowService } from './show.service';

@Injectable({ providedIn: 'root' })
export class MigrationService {
    constructor(
        private settingSvc: SettingService,
        private episodeSvc: EpisodeService,
        private showSvc: ShowService,
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
        await this.settingSvc.saveFileToDb(model.settings);
        const episode_list: IMyTvQShowEpisodeFlatV5[] = [];

        await this.showSvc.saveFileToDb(model.show_list);
        model.show_list.forEach(async show => {
            await this.episodeSvc.saveFileToDb(show.episode_list);
        });
        await this.showSvc.updateAllShowReference();
        // nsr.myTvQ.notify.AddShowNotifications(show, episode_list)
    }

    export(): string {
        return '';
    }
}
