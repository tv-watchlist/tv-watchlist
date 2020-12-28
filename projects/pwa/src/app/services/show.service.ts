import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IMyTvQ, IMyTvQSetting, IMyTvQShow, IMyTvQShowEpisode } from './model';
import { Observable, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import myTvQJson from '../../assets/tv-watchlist-2020-12-23.json';

@Injectable({providedIn: 'root'})
export class ShowService {
    constructor(private httpClient: HttpClient) {
        this.initAll();
    }
    EndedRegex = /Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i;
    shows: Map<string, IMyTvQShow> = new Map();
    uiShowIdOrder: string[] = [];
    settings!: IMyTvQSetting;
    getMyTvQJson(): Observable<IMyTvQ> {
        return of(myTvQJson);
        // return this.httpClient.get<IMyTvQ>('./tv-watchlist-2020-12-23.json');
    }

    initAll(): void {
        const showList = (myTvQJson as IMyTvQ).show_list;
        this.settings = (myTvQJson as IMyTvQ).settings;
        showList.forEach(o => {
            this.shows.set(o.show_id, o);
        });
        const showsOrder = this.settings.shows_order;
        const now = new Date().getTime();
        if (showsOrder === 'showname') {
            // http://www.javascriptkit.com/javatutors/arraysort2.shtml
            if (showList.length){
                showList.sort((a, b) => {
                    const x = a.name.toLowerCase();
                    const y = b.name.toLowerCase();
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }
            this.uiShowIdOrder = showList.map(o => o.show_id);
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
                const x = (b.previous_episode || b.last_episode || {local_showtime: null}).local_showtime;
                const y = (a.previous_episode || a.last_episode || {local_showtime: null}).local_showtime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            // console.log(tba_show_list);

            // completed
            const endedShowList = showList.filter((item, index) => {
                return (item.status || '').match(this.EndedRegex);
            });
            // sort by desc
            endedShowList.sort((a, b) => {
                const x = (b.last_episode || {local_showtime: null}).local_showtime;
                const y = (a.last_episode || {local_showtime: null}).local_showtime;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            const tbaEnded = tbaShowList.concat(endedShowList);

            let newShowList = futureShowList.concat(tbaEnded);

            if ( showsOrder === 'unseen' ) {
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
            this.uiShowIdOrder = newShowList.map(o => o.show_id);
        }
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

@Injectable({providedIn: 'root'})
export class EpisodeService {
    constructor(
        private datePipe: DatePipe,
        ){

        }
    getEpisodeName(episode: IMyTvQShowEpisode): string {
        if (!!episode) {
            return episode.special ? `[Special ${episode.counter}] ${episode.name}` :
                `${episode.counter}.(${episode.season}x${episode.number}) ${episode.name}`;
        } else {
            return 'TBA';
        }
    }

    getNextEpisodeDays(episode: IMyTvQShowEpisode): string {
        if (!episode) {
            return 'TBA';
        }
        return this.getDaysBetweenToEnglish(new Date(), new Date(episode.local_showtime));
    }


    getFormattedTime(episode: IMyTvQShowEpisode): string | null {
        return this.datePipe.transform(episode.local_showtime, '(EEE h:mm a, MMM d, y)') || '(n/a)';
    }

    getFormattedDate(episode: IMyTvQShowEpisode): string | null {
        return this.datePipe.transform(episode.local_showtime, '(MMM d, y)') || '(n/a)';
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
