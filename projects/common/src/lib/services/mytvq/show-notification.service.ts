import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from '../common.service';
import { IMyTvQDbEpisode, IMyTvQDbShow, IMyTvQDbShowNotification } from '../storage/db.model';
import { WebDatabaseService } from '../storage/web-database.service';
import { EpisodeService } from './episode.service';
import { SettingService } from './setting.service';

export interface IUIShowNotification {
    showName: string;
    time: string;
    episodeName: string;
}

@Injectable({ providedIn: 'root' })
export class ShowNotificationService {
    private subject: Subject<IUIShowNotification>;
    constructor(
        private webDb: WebDatabaseService,
        private settingSvc: SettingService,
        private episodeSvc: EpisodeService,
        private datePipe: DatePipe,
        private commonSvc: CommonService) {
            this.subject = new Subject<IUIShowNotification>();
    }

    subscribe(next?: (value: IUIShowNotification) => void, error?: (err:any)=>void) {
        return this.subject.subscribe({next, error});
    }

    async displayShowNotifications(now = new Date()) {
        const settings = await this.settingSvc.getAll();

        const enabled = settings.enableNotification;
        if (enabled) {
            const list = await this.getUntilNotifications(now.getTime());
            if (list.length > 0) {
                console.log('GetNotifications:', list);
                list.forEach(async (notify) => {
                    let episode = notify.episode;
                    let gap = Math.abs(this.commonSvc.getDaysBetween(new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                        new Date(notify.notifyTime)));
                    if (now >= new Date(notify.notifyTime) && gap < 1) {
                        let timezone_offset = settings.timezoneOffset || {};
                        let offset_next_date = !!episode.localShowTime ? new Date(episode.localShowTime) : new Date();
                        if (timezone_offset[notify.country]) {
                            offset_next_date.setMinutes(offset_next_date.getMinutes() + (60 * Number(timezone_offset[notify.country])));
                        }
                        let strDt = ' ';
                        if (now.getDate() == offset_next_date.getDate()) {
                            strDt = 'Today ';
                        } else if (now.getDate() > offset_next_date.getDate()) {
                            strDt = 'Yesterday ';
                        } else if (now.getDate() < offset_next_date.getDate()) {
                            strDt = 'Tomorrow ';
                        }
                        let episodeTitle = '';
                        if (episode.special) {
                            episodeTitle = "[Special " + episode.counter + "] " + episode.name;
                        } else {
                            episodeTitle = episode.counter + ".(" + episode.season + "x" + episode.number + ") " + episode.name;
                        }

                        this.subject.next({
                            showName: this.commonSvc.toTitleCase(notify.showName),
                            time: `${strDt}${this.datePipe.transform(offset_next_date, 'h:MM TT')}`,
                            episodeName: episodeTitle
                        });

                        await this.deleteByIdNotification(notify.id);
                    }
                    if (gap >= 1) {
                        await this.deleteByIdNotification(notify.id);
                    }
                });
            }
        }
        console.log('enable_notification:', enabled);
    }

    async addShowNotifications(show: IMyTvQDbShow, episode_list: IMyTvQDbEpisode[]) {
        const settings = await this.settingSvc.getAll();
        const now = (new Date()).getTime();
        const timezone_offset = settings.timezoneOffset || {};
        const notify_before = settings.notifyBeforeMin || 0;
        const notify_list: IMyTvQDbShowNotification[] = [];
        episode_list.forEach((episode) => {
            if (!episode.localShowTime) return;

            const day = new Date(episode.localShowTime);
            const country_code = (!!show.channel && show.channel.country) ? show.channel.country.code : "US"
            if (day.getTime() > now) {//only future shows
                if (timezone_offset[country_code]) {
                    day.setMinutes(day.getMinutes() + (60 * Number(timezone_offset[country_code])));
                }
                let notify_time = 0;
                if (notify_before === 0) {
                    notify_time = (new Date(day.getFullYear(), day.getMonth(), day.getDate())).getTime();
                } else {
                    day.setMinutes(day.getMinutes() - Number(notify_before));
                    notify_time = day.getTime();
                }

                const obj: IMyTvQDbShowNotification = {
                    id: episode.episodeId,
                    notifyTime: notify_time,
                    showId: show.showId,
                    showName: show.name,
                    episode: episode,
                    country: country_code,
                };

                notify_list.push(obj);
            }
        });
        await this.deleteShowNotifications(show.showId);
        await this.webDb.putList('showsNotifications', notify_list);
    }

    async getShowNotifications(showId: string) {
        return await this.webDb.getIndexedList<'showsNotifications', IMyTvQDbShowNotification>('showsNotifications', 'showIdIndex', this.webDb.getKeyRange('=', showId));
    }

    async getUntilNotifications(time: number) {
        return await this.webDb.getIndexedList<'showsNotifications', IMyTvQDbShowNotification>('showsNotifications', 'notifyTimeIndex', this.webDb.getKeyRange('<=', time));
    }

    async deleteByIdNotification(notifyId: string) {
        await this.webDb.deleteObj('showsNotifications', notifyId);
    }

    async deleteShowNotifications(showId: string) {
        await this.webDb.deleteRange('showsNotifications', 'showIdIndex', this.webDb.getKeyRange('=', showId));
    }

    async deleteUntilNotifications(time: number) {
        return await this.webDb.deleteRange('showsNotifications', 'notifyTimeIndex', this.webDb.getKeyRange('<=', time));
    }

    async refreshNotifications(showList: IMyTvQDbShow[]) {
        showList.forEach(async (show) => {
            const episodeList = await this.episodeSvc.getEpisodeList(show.showId);
            await this.addShowNotifications(show, episodeList);
        });
    }
}
