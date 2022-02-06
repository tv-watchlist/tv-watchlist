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
// export declare type IndexNames<DBTypes extends DBSchema | unknown, StoreName extends StoreNames<DBTypes>> = DBTypes extends DBSchema ? keyof DBTypes[StoreName]['indexes'] : string;

// export interface MyTvQStoreName extends StoreNames<IMyTvQDBv1> {}

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

    // updated by cron
    nextUpdateTime: number;
    unseenCount: number;
    totalEpisodes: number;
    totalSeasons: number;
    firstEpisode?: {episodeId: string; localShowTime: number;};
    previousEpisode?: {episodeId: string; localShowTime: number;};
    nextEpisode?: {episodeId: string; localShowTime: number;};
    lastEpisode?: {episodeId: string; localShowTime: number;};
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
