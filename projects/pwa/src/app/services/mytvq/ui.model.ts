import { DatePipe } from '@angular/common';
import { IMyTvQDbShow, IMyTvQDbEpisode } from '../storage/db.model';

export class UiShowModel {
    constructor(show: IMyTvQDbShow) {
        const today = new Date().getTime();
        this.id = show.showId;
        this.apiSource = show.apiSource;
        this.apiId = show.apiId[show.apiSource] as string;
        this.name = show.name;
        this.premiered = !!show.premiered ? show.premiered.substring(0, 4) : '';
        this.banner = show.image?.banner[0] || '';
        this.poster = show.image?.poster[0] || '';
        this.channel = show.channel.name || '';
        this.language = show.language;
        this.genres = show.showType + ' - ' + show.genres.join(', ');

        this.schedule = `${(show.schedule?.days || []).join(', ')}${(show.schedule?.time ? ' at ' + show.schedule?.time :'')}${show.runtime ? ' ('+show.runtime+' mins)':''}`;
        this.userRating = !!show.userRating ? `${show.userRating.average}/10 ${(show.userRating.count ? '('+show.userRating.count+'votes)':'')}`: '';
        this.summary = show.summary;
        this.url = show.url;
        this.statusText = show.status;

        this.totalSeasons = show.totalSeasons;
        this.unseenCount = show.unseenCount;
        this.totalEpisodes = show.totalEpisodes;
        this.expand = false;
    }

    id: string;
    name: string;
    apiSource: string;
    apiId: string;
    premiered: string;
    channel: string;
    status = 0;
    statusText: string;
    banner: string;
    poster: string;
    language: string;
    summary: string;
    url: string;
    genres: string;
    schedule: string;
    userRating: string;
    totalEpisodes: number;
    unseenCount: number;
    totalSeasons: number;

    expand: boolean;

    // show which is coming up next
    latestEpisodeId = '';
    latestEpisodeName = '';
    latestEpisodeDateFormatted = '';
    latestEpisodeInDays = '';

    // next unseen episode
    unseenEpisodeId = '';
    unseenEpisodeName = '';
}

export class UiEpisodeModel {
    constructor(private episode: IMyTvQDbEpisode) {
        const today = new Date().getTime();
        this.id = episode.episodeId;
        this.episodeName = this.getEpisodeName() || 'TBA';
        this.dateFormatted = '';
        this.summary = episode.summary || '';
        this.isUnaired = (episode.localShowTime || 0) > today;
        this.image = episode.poster || '';
        this.seen = episode.seen;
        this.expand = false;
        this.url = episode.url;
    }

    public id: string;
    public image: string;
    public episodeName: string;
    public dateFormatted: string;
    public summary: string;
    public isUnaired: boolean;
    public seen: boolean;
    public expand: boolean;
    public url: string;

    getEpisodeName(): string {
        if (!!this.episode) {
            return this.episode.special ? `[Special ${this.episode.counter}] ${this.episode.name}` :
                `${this.episode.counter}.(${this.episode.season}x${this.episode.number}) ${this.episode.name}`;
        } else {
            return '';
        }
    }

    setFormattedDate(offset: number| undefined, datePipe: DatePipe) {
        if (this.episode.localShowTime) {
            const offsetNextDate = new Date(this.episode.localShowTime);
            if (!!offset) {
                offsetNextDate.setMinutes(offsetNextDate.getMinutes() + (60 * offset));
            }
            // Sat 1:25 PM, Jul 23rd, 2016
            if (this.isUnaired) {
                this.dateFormatted = datePipe.transform(offsetNextDate, 'EEE hh:mm a, MMM dd, y') || 'n/a';
            } else {
                this.dateFormatted = datePipe.transform(offsetNextDate, 'MMM dd, y') || 'n/a';
            }
        } else {
            this.dateFormatted = 'n/a';
        }
    }
}
