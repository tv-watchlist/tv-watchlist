import { DatePipe } from "@angular/common";
import { IMyTvQShowEpisodeFlatV5, IMyTvQShowFlatV5 } from "./flat-file-v5.model";

export interface IUiShowModel {
    id: string;
    name: string;
    premiered: string;
    channel: string;
    status: number;
    banner: string;
    latestEpisodeName: string;
    latestEpisodeDateFormatted: string;
    latestEpisodeIn: string;
    nextEpisodeName: string;
    unseenEpisodes: number;
    totalEpisodes: number;
    expand: boolean;
}

export class UiShowModel {
    constructor(show: IMyTvQShowFlatV5) {
        const today = new Date().getTime();
        this.id = show.show_id;
        this.name = show.name;
        this.premiered = !!show.premiered ? show.premiered.substring(0, 4) : '';
        this.banner = show.image?.banner[0] || '';
        this.poster = show.image?.poster[0] || '';
        this.channel = show.channel.name || '';
        this.unseenCount = show.unseen_count;
        this.totalEpisodes = show.total_episodes;
        this.language = show.language;
        this.genres = show.genres;
        this.runtime = show.runtime;
        this.contentRating = show.content_rating;
        this.summary = show.summary;
        this.url = show.url;
        this.totalSeasons = 0;
        this.expand = false;
    }

    id: string;
    name: string;
    premiered: string;
    channel: string;
    status = 0;
    banner: string;
    poster: string;
    latestEpisodeName = '';
    latestEpisodeDateFormatted = '';
    latestEpisodeIn = '';
    nextEpisodeName = '';
    totalEpisodes: number;
    expand: boolean;

    language: string;
    genres: string[];
    runtime: number;
    contentRating: string;
    unseenCount: number;
    totalSeasons: number;
    summary: string;
    url: string;
}

export interface IUiEpisodeModel {
    id: string;
    image: string;
    episodeName: string;
    dateFormatted: string;
    summary: string;
    isUnaired: boolean;
    seen: boolean;
    expand: boolean;
    url: string;
}

export class UiEpisodeModel {
    constructor(private episode: IMyTvQShowEpisodeFlatV5) {
        const today = new Date().getTime();
        this.id = episode.episode_id;
        this.episodeName = this.getEpisodeName() || 'TBA';
        this.dateFormatted = '';
        this.summary = episode.summary || '';
        this.isUnaired = episode.local_showtime > today;
        this.image = Array.isArray(episode.image?.poster) ? episode.image?.poster[0] : episode.image?.poster;
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
        if (this.episode.local_showtime) {
            const offsetNextDate = new Date(this.episode.local_showtime);
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

export interface IUiSetting {
    updateTime: number;
    showsOrder: string;
    version: number;
    defaultEpisodes: string;
    hideTba: boolean;
    hideSeen: boolean;
    defaultCountry: string;
    timezoneOffset: {
        [country: string]: number;
    };
}

export interface IShowImportantEpisodes {
    first: UiEpisodeModel | undefined;
    last: UiEpisodeModel | undefined;
    next: UiEpisodeModel | undefined;
    latest: UiEpisodeModel | undefined;
}
