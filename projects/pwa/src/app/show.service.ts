import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IMyTvQ, IMyTvQShow, IMyTvQShowEpisode } from './model';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';

@Injectable({providedIn: 'root'})
export class ShowService {
    constructor(private httpClient: HttpClient) { }
    EndedRegex = /Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i;

    getMyTvQJson(): Observable<IMyTvQ> {
       return this.httpClient.get<IMyTvQ>('./tv-watchlist-2020-12-23.json');
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
