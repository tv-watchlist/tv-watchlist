import { Injectable } from '@angular/core';
import { IMyTvQDbSetting, MyTvQDbSetting } from '../storage/db.model';
import { WebDatabaseService } from '../storage/web-database.service';
import { IMyTvQSettingFlatV5 } from './flat-file-v5.model';


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

    public async save(key: keyof IMyTvQDbSetting, value: any) {
        return await this.webDb.putObj('settings', value, key);
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
            const defaults = MyTvQDbSetting.default;
            const model: IMyTvQDbSetting = {
                defaultCountry: settings.default_country || defaults.defaultCountry,
                hideSeen: settings.hide_seen,
                episodesOrder: settings.default_episodes|| defaults.episodesOrder,
                hideTba: settings.hide_tba,
                showsOrder: settings.shows_order || defaults.showsOrder,
                updateTime: settings.update_time || defaults.updateTime,
                timezoneOffset: settings.timezone_offset|| defaults.timezoneOffset,
                version: defaults.version,
                showIdOrderList: defaults.showIdOrderList,
            }
            this.webDb.putKeyValueBulk('settings', model);
        }
    }


}
