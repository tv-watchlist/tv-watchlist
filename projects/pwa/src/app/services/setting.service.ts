import { Injectable } from '@angular/core';
import { IMyTvQSettingFlatV5 } from './flat-file-v5.model';
import { IUiSetting } from './ui.model';
import { WebDatabaseService } from './web-database.service';


@Injectable({ providedIn: 'root' })
export class SettingService {
    constructor(private webDb: WebDatabaseService) {
    }

    private settings!: IUiSetting;

    get showsOrder(): string {
        return this.settings.showsOrder || 'airdate';
    }

    set showsOrder(val: string) {
        this.settings.showsOrder = val;
    }

    get DefaultEpisodes(): string {
        return this.settings.defaultEpisodes || 'bookmarked';
    }

    set DefaultEpisodes(val: string) {
        this.settings.defaultEpisodes = val;
    }

    get hideTba(): boolean {
        return this.settings.hideTba || false;
    }

    set hideTba(val: boolean) {
        this.settings.hideTba = val;
    }

    get hideSeen(): boolean {
        return this.settings.hideSeen || false;
    }

    set hideSeen(val: boolean) {
        this.settings.hideSeen = val;
    }

    get defaultCountry(): string {
        return this.settings.defaultCountry || 'US';
    }

    public async initSettings(): Promise<void> {
        this.settings = await this.webDb.getAllAsObject<IUiSetting>('settings');
    }

    public async save(name: string, value: any) {
        return await this.webDb.putObj("settings", value, name);
    }

    public async saveAll(settings?: IMyTvQSettingFlatV5) {
        if (!!settings) {
            const model: IUiSetting = {
                defaultCountry: settings.default_country,
                hideSeen: settings.hide_seen,
                defaultEpisodes: settings.default_episodes,
                hideTba: settings.hide_tba,
                showsOrder: settings.shows_order,
                updateTime: settings.update_time,
                timezoneOffset: settings.timezone_offset,
                version: 5
            }
            this.webDb.putKeyValueBulk('settings', model);
        } else {
            this.webDb.putKeyValueBulk('settings', this.settings);
        }
    }

    getTimezoneOffset(country?: string): number | undefined {
        const timezoneOffset = this.settings.timezoneOffset || {};
        return +timezoneOffset[country || this.defaultCountry];
    }
}
