import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebDatabaseService } from '../storage/web-database.service';
import { EpisodeService } from './episode.service';
import { IMyTvQFlatV5, IMyTvQShowEpisodeFlatV5 } from './flat-file-v5.model';
import { IMyTvQFlatV6 } from './flat-file-v6.model';
import { SettingService } from './setting.service';
import { ShowNotificationService } from './show-notification.service';
import { ShowService } from './show.service';

@Injectable({ providedIn: 'root' })
export class MigrationService {
    constructor(
        private settingSvc: SettingService,
        private episodeSvc: EpisodeService,
        private showSvc: ShowService,
        private notifySvc: ShowNotificationService,
        private webDb: WebDatabaseService,
    ) {
        this.now = new Date().getTime();
    }

    now: number;

    async import(content: string): Promise<void> {
        const backup = JSON.parse(content) as {data_structure_version: number};
        if(backup.data_structure_version === 6) {
            this.importV6(backup as IMyTvQFlatV6);
        } else {
            this.importV5(backup as IMyTvQFlatV5);
        }
    }

    public async importV5(model: IMyTvQFlatV5): Promise<void> {
        console.log('fileContent', model);
        if(!('data_structure_version' in model)) {
            throw new Error('file content does not contain TV Watchlist backup.');
        }
        if(model.data_structure_version < 5){
            throw new Error(`TV Watchlist backup is in old format v${model.data_structure_version}.`);
        }
        await this.webDb.clearAllStores();
        await this.settingSvc.saveFileToDb(model.settings);
        const episode_list: IMyTvQShowEpisodeFlatV5[] = [];

        await this.showSvc.saveFileToDb(model.show_list);
        model.show_list.forEach(async show => {
            await this.episodeSvc.saveFileToDb(show.episode_list);
        });
        await this.showSvc.updateAndSaveAllShowReference();
        const showList = await this.showSvc.getAll();
        showList.forEach(async show => {
            const episodeList = await this.episodeSvc.getEpisodeList(show.showId);
            await this.notifySvc.addShowNotifications(show, episodeList);
        });
    }

    public async importV6(model: IMyTvQFlatV6): Promise<void> {
        console.log('fileContent', model);
        if(!('data_structure_version' in model)) {
            throw new Error('file content does not contain TV Watchlist backup.');
        }
        if(model.data_structure_version !== 6){
            throw new Error(`TV Watchlist backup is in old format v${model.data_structure_version}.`);
        }
        await this.webDb.clearAllStores();
        await this.settingSvc.saveAll(model.settings);
        await this.showSvc.saveAll(model.show_list);
        await this.episodeSvc.saveAll(model.episode_list);
        await this.showSvc.updateAndSaveAllShowReference();
        const showList = await this.showSvc.getAll();
        showList.forEach(async show => {
            const episodeList = await this.episodeSvc.getEpisodeList(show.showId);
            await this.notifySvc.addShowNotifications(show, episodeList);
        });
    }

    async export(): Promise<string> {
        const settings = await this.settingSvc.getAll();
        const shows =  (await this.showSvc.getAll()).map(s => {
            delete s.futureEpisode;
            delete s.pastEpisode;
            delete s.unseenEpisode;
            return s;
        });
        const episodes = await this.episodeSvc.getAll();
        const backup = {
            data_structure_version: 6,
            settings: settings,
            show_list: shows,
            episode_list: episodes
        }
        return JSON.stringify(backup);
    }
}
