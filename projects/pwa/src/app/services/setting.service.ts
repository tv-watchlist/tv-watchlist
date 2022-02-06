import { Injectable } from '@angular/core';
import { IMyTvQDbSetting } from './db.model';
import { IMyTvQSettingFlatV5 } from './flat-file-v5.model';
import { IUiSetting } from './ui.model';
import { WebDatabaseService } from './web-database.service';


@Injectable({ providedIn: 'root' })
export class SettingService {
    constructor(private webDb: WebDatabaseService) {
    }

    async get<T>(key: keyof IMyTvQDbSetting) {
        return await this.webDb.getObj('settings',key) as T;
    }

    public async getAll(): Promise<IMyTvQDbSetting> {
        return await this.webDb.getAllAsObject<IMyTvQDbSetting>('settings');
    }

    public async save(name: string, value: any) {
        return await this.webDb.putObj('settings', value, name);
    }

    public async saveAll(settings: IMyTvQDbSetting): Promise<boolean> {
        return await this.webDb.putKeyValueBulk('settings', settings);
    }

    public async getTimezoneOffset(country?: string) {
        const timezoneOffset = await this.get<{ [country: string]: number}>('timezoneOffset');
        const defaultCountry = await this.get<string>('defaultCountry')
        return +timezoneOffset[country || defaultCountry];
    }

    public async saveFileToDb(settings?: IMyTvQSettingFlatV5) {
        if (!!settings) {
            const model: IMyTvQDbSetting = {
                defaultCountry: settings.default_country,
                hideSeen: settings.hide_seen,
                defaultEpisodes: settings.default_episodes,
                hideTba: settings.hide_tba,
                showsOrder: settings.shows_order,
                updateTime: settings.update_time,
                timezoneOffset: settings.timezone_offset,
                version: 5,
                showIdOrderList: [],
            }
            this.webDb.putKeyValueBulk('settings', model);
        }
    }


}
