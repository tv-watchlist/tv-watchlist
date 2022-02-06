import { Injectable } from '@angular/core';
import { IMyTvQDbSetting } from './db.model';
import { IMyTvQSettingFlatV5 } from './flat-file-v5.model';
import { IUiSetting } from './ui.model';
import { WebDatabaseService } from './web-database.service';


@Injectable({ providedIn: 'root' })
export class SettingService {
    constructor(private webDb: WebDatabaseService) {
    }

    public static get default(): IMyTvQDbSetting {
        return {
            updateTime: (new Date()).getTime(),
            showsOrder: 'airdate',
            version: 5,
            defaultEpisodes: 'bookmarked',
            hideTba: true,
            hideSeen: true,
            defaultCountry: 'US',
            showIdOrderList: [],
            timezoneOffset: {US: 0}
        }
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
            const defaults = SettingService.default;
            const model: IMyTvQDbSetting = {
                defaultCountry: settings.default_country || defaults.defaultCountry,
                hideSeen: settings.hide_seen,
                defaultEpisodes: settings.default_episodes|| defaults.defaultEpisodes,
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
