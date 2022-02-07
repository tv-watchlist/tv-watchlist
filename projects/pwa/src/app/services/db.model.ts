import { DBSchema, IndexNames, StoreNames } from 'idb'; // https://github.com/jakearchibald/idb#typescript

export type MyTvQStoreName = 'settings' | 'shows' | 'episodes';

export interface IMyTvQDBv1 extends DBSchema {
    settings: {key: string, value: any};

    shows: {key: string, value: IMyTvQDbShow, indexes: { 'nextUpdateTimeIndex': number }};

    episodes: {key: string, value: IMyTvQDbEpisode, indexes: {
        'showIdIndex': string,
        'localShowtimeIndex': number }
    };
}

export interface IMyTvQDbShow {
    showId: string;
    name: string;
    url: string;
    showType: string;
    language: string;
    genres: string[];
    status: string;
    runtime: number;
    premiered: string;
    summary: string;
    cast: string[];
    schedule: {
        time: string;
        days: string[];
    };
    userRating: {
        average: number;
        count: number
    };
    contentRating: string;
    channel: {
        name: string;
        country: {
            name: string;
            code: string;
            timezone: string;
        }
    };
    apiSource: string;
    apiId: {[key: string]: string|number};
    image: {
        banner: string[];
        poster: string[];
    };

    /**
     * next fetch date
     */
    nextUpdateTime: number;
    unseenCount: number;
    totalEpisodes: number;
    totalSeasons: number;
    /**
     * episode user has to watch next
     */
    unseenEpisode?: IMyTvQDbEpisode;
    /**
     * future episode to be aired
     */
    futureEpisode?: IMyTvQDbEpisode;
    /**
     * last/past aired episode
     */
    pastEpisode?: IMyTvQDbEpisode;
}

export interface IMyTvQDbEpisode {
    episodeId: string;
    showId: string;
    localShowTime: number;
    name: string;
    url: string;
    iso8601: string|Date;
    runtime: number;
    season: number;
    number: number;
    counter: number;
    special: boolean;
    summary: string;
    poster: string;
    seen: boolean;
    previousId: string;
    nextId: string;
    apiSource: string;
    apiId: {[key: string]: string|number}
}

export interface IMyTvQDbSetting {
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
    showIdOrderList: string[];
}
