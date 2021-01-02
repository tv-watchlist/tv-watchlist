import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IMyTvQ, IMyTvQSetting, IMyTvQShow, IMyTvQShowEpisode } from './model';
import { Observable, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import myTvQJson from '../../assets/tv-watchlist-2020-12-23.json';


@Injectable({ providedIn: 'root' })
export class TvWatchlistService {
    constructor(
        private settingSvc: SettingService,
        private showSvc: ShowService,
    ) {
        this.now = new Date().getTime();
    }

    now: number;

    getMyTvQJson(): Observable<IMyTvQ> {
        return of(myTvQJson);
        // return this.httpClient.get<IMyTvQ>('./tv-watchlist-2020-12-23.json');
    }

    initAll(): Observable<boolean> {
        this.settingSvc.initSettings((myTvQJson as IMyTvQ).settings);
        this.showSvc.initShowList(this.settingSvc.showsOrder, (myTvQJson as IMyTvQ).show_list);
        return of(true);
    }
}

@Injectable({ providedIn: 'root' })
export class SettingService {
    private settings!: IMyTvQSetting;

    initSettings(settings: IMyTvQSetting): void {
        this.settings = settings;
    }

    getSettings(): IMyTvQSetting {
        return this.settings;
    }

    get showsOrder(): string {
        return this.settings.shows_order;
    }

    getTimezoneOffset(country?: string): number | undefined {
        const timezoneOffset = this.settings.timezone_offset || {};
        return !!country ? +timezoneOffset[country] : undefined;
    }
}

@Injectable({ providedIn: 'root' })
export class ShowService {
    constructor(private commonSvc: CommonService) {
    }

    private EndedRegex = /Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i;

    shows: Map<string, IMyTvQShow> = new Map();
    showIdOrder: string[] = [];

    initShowList(showsOrder: string, showList: IMyTvQShow[]): void {
        showList.forEach(o => {
            this.shows.set(o.show_id, o);
        });
        if (showsOrder === 'showname') {
            // http://www.javascriptkit.com/javatutors/arraysort2.shtml
            if (showList.length) {
                showList.sort((a, b) => {
                    const x = a.name.toLowerCase();
                    const y = b.name.toLowerCase();
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }
            this.showIdOrder = showList.map(o => o.show_id);
        }
        else { // unseen or default airdate
            // get future shows
            const futureShowList = showList.filter((item) => {
                return !!item.next_episode;
            });
            // sort by asc
            futureShowList.sort((a, b) => {
                const x = a.next_episode.local_showtime;
                const y = b.next_episode.local_showtime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            // tba
            const tbaShowList = showList.filter((item) => {
                return !(item.status || '').match(this.EndedRegex) && !item.next_episode;
            });

            // sort by desc
            tbaShowList.sort((a, b) => {
                const x = (b.previous_episode || b.last_episode || { local_showtime: null }).local_showtime;
                const y = (a.previous_episode || a.last_episode || { local_showtime: null }).local_showtime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            // console.log(tba_show_list);

            // completed
            const endedShowList = showList.filter((item, index) => {
                return (item.status || '').match(this.EndedRegex);
            });
            // sort by desc
            endedShowList.sort((a, b) => {
                const x = (b.last_episode || { local_showtime: null }).local_showtime;
                const y = (a.last_episode || { local_showtime: null }).local_showtime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            const tbaEnded = tbaShowList.concat(endedShowList);

            let newShowList = futureShowList.concat(tbaEnded);

            if (showsOrder === 'unseen') {
                const showListUnseen = newShowList.filter((item) => {
                    return item.unseen_count > 0;
                });
                const showListSeen = newShowList.filter((item) => {
                    return item.unseen_count === 0;
                });
                showListUnseen.sort((a, b) => {// desc
                    const x = b.unseen_count;
                    const y = a.unseen_count;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
                newShowList = showListUnseen.concat(showListSeen);
            }
            this.showIdOrder = newShowList.map(o => o.show_id);
        }
    }

    getShow(showId: string): IMyTvQShow | undefined {
        return this.shows.get(showId);
    }

    getShowByEpisodeId(episodeId: string): IMyTvQShow | undefined {
        const showId = episodeId.split('_')[0];
        return this.shows.get(showId);
    }

    getEpisodeList(showId: string): { [episodeId: string]: IMyTvQShowEpisode } {
        return this.shows.get(showId)?.episode_list || {};
    }

    getEpisode(episodeId: string): IMyTvQShowEpisode | undefined {
        const list = this.getShowByEpisodeId(episodeId)?.episode_list;
        return list && list[episodeId];
    }

    getShowStatus(show: IMyTvQShow): -1 | 0 | 1 {
        if ((show.status || '').match(this.EndedRegex)) {
            return -1; // Completed
        }
        const episode = show.next_episode || show.last_episode;

        // console.log(show, episode);
        const now = new Date().getTime();
        if (!!episode && !!episode.local_showtime && episode.local_showtime > now) {
            return 0; // Running
        }
        else {
            return 1; // TBA
        }
    }
}

@Injectable({ providedIn: 'root' })
export class EpisodeService {
    constructor(
        private commonSvc: CommonService,
        private datePipe: DatePipe,
    ) {
    }

    // episodes: Map<string, IMyTvQShow> = new Map();
    createEpisodeId(episode: IMyTvQShowEpisode): string {
        if (episode.special) {
            return `${episode.show_id}_${this.commonSvc.zeroPad(episode.counter, 4)}_${this.commonSvc.zeroPad(episode.season, 4)}_S${this.commonSvc.zeroPad(episode.number, 4)}`;
        } else {
            return `${episode.show_id}_${this.commonSvc.zeroPad(episode.counter, 4)}_${this.commonSvc.zeroPad(episode.season, 4)}_${this.commonSvc.zeroPad(episode.number, 4)}`;
        }
    }

    getEpisodeName(episode?: IMyTvQShowEpisode): string {
        if (!!episode) {
            return episode.special ? `[Special ${episode.counter}] ${episode.name}` :
                `${episode.counter}.(${episode.season}x${episode.number}) ${episode.name}`;
        } else {
            return 'TBA';
        }
    }

    getNextEpisodeDays(episode?: IMyTvQShowEpisode): string {
        if (!episode) {
            return 'TBA';
        }
        return this.commonSvc.getDaysBetweenToEnglish(new Date(), new Date(episode.local_showtime));
    }

    getFormattedTime(episode: IMyTvQShowEpisode): string | null {
        return this.datePipe.transform(episode.local_showtime, '(EEE h:mm a, MMM d, y)') || '(n/a)';
    }

    getFormattedDate(episode: IMyTvQShowEpisode): string | null {
        return this.datePipe.transform(episode.local_showtime, '(MMM d, y)') || '(n/a)';
    }
}

@Injectable({ providedIn: 'root' })
export class CommonService {
    constructor() {
        this.now = new Date().getTime();
    }
    private now: number;

    get time(): number {
        return this.now;
    }

    zeroPad(num: number, places: number): string {
        if (!num) { num = 0; }
        return Array(Math.max(places - String(num).length + 1, 0)).join('0') + num;
    }

    sortFunction(x: any, y: any): number {
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }

    getDaysBetween(first: Date, second: Date): number {
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const millisBetween = second.getTime() - first.getTime();
        const days = Math.abs(millisBetween / millisecondsPerDay);
        // console.log('first:' + first.toString() + ' second:' + second.toString() + ' daysBetween:' + days);
        return +days.toFixed(4);
    }

    getDaysBetweenToEnglish(first: Date, second: Date): string {
        if (!first || !second) {
            return '';
        }

        const days = this.getDaysBetween(
            new Date(first.getFullYear(), first.getMonth(), first.getDate()),
            new Date(second.getFullYear(), second.getMonth(), second.getDate()));

        if (+(days / 365).toFixed(2) > 2) {
            return 'TBA';
        }
        if (days < 1) {
            return 'Today';
        } else if (days < 2) {
            return 'Tomorrow';
        } else if (days < 30) {
            return days + ' Day(s)';
        } else if (days < 90) {
            return (days / 7).toFixed(0) + ' Week(s)';
        } else if (days < 365) {
            return (days / 30).toFixed(0) + ' Month(s)';
        } else {
            return (days / 365).toFixed(2) + ' Year(s)';
        }
    }
}
