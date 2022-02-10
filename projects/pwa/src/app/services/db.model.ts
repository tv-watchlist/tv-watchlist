import { DBSchema } from 'idb'; // https://github.com/jakearchibald/idb#typescript

export type MyTvQStoreName = 'settings' | 'shows' | 'episodes';

export interface IMyTvQDBv1 extends DBSchema {
    settings: {key: string, value: any};

    shows: {key: string, value: IMyTvQDbShow, indexes: { 'updateTimeIndex': number }};

    episodes: {key: string, value: IMyTvQDbEpisode, indexes: {
        'showIdIndex': string,
        'localShowTimeIndex': number }
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
     * time data got updated from web-api
     */
    updateTime: number;
    /**
     * time when user marked an episode as seen
     */
    lastWatchedTime: number;
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
    localShowTime?: number;
    name: string;
    url: string;
    iso8601: string|Date;
    runtime: number;
    season: number;
    number: number;
    counter: number;
    special: boolean;
    summary: string;
    poster?: string;
    seen: boolean;
    previousId?: string;
    nextId?: string;
    apiSource: string;
    apiId: {[key: string]: string|number}
}

export interface IMyTvQDbSetting {
    /**
     * time when last smart update was run.
     */
    updateTime: number;
    /**
     * the sequence of shows to show in dashboard
     */
    showsOrder: string;
    /**
     * data version
     */
    version: number;
    /**
     * show latest or only unwatched episodes in details landing page
     */
    defaultEpisodes: string;
    /**
     * hide TBA shows in dashboard
     */
    hideTba: boolean;

    /**
     * Hide seen episodes
     */
    hideSeen: boolean;
    /**
     * User's default country for timezone calculations
     */
    defaultCountry: string;
    /**
     * Country offset to show correct time (maybe due to daytime savings)
     */
    timezoneOffset: {
        [country: string]: number;
    };

    /**
     * the list of shows to show in dashboard
     */
    showIdOrderList: string[];
}
/*
// Old settings
"advanced_css_hack": 0,
"animate_icon": 1,
"badge_flag": "shows",
"compact_flag": 0,
"default_country": "US",
"enable_banner": 1,
"enable_notification": 1,
"listings_next_update_date": 1377567846307,
"override_episode_summary_link": "http://www.google.com/search?btnI=1&q={show_name.slug()}+official+website",
"schedules_next_update_date_US": 1377567792447,
"shows_order": "airdate",
"shows_update_frequency": 86400000,
"hide_tba": false,
"hide_seen": true,
"update_time": 1608818693879
"ui": {
    "runningUnseen": {
        "cssText": "background-color:#ac0;background-image:-webkit-linear-gradient(45deg, rgba(255, 255, 255, .2) 25%, transparent 25%,transparent 50%, rgba(255, 255, 255, .2) 50%, rgba(255, 255, 255, .2) 75%,transparent 75%, transparent);background-size:26px 26px;"
    },
    "runningSeen": {
        "cssText": "background-color:rgba(170, 204, 0, 0.8);color:rgb(0, 0, 0);"
    },
    "tbaUnseen": {
        "cssText": "background-color:#0ae;background-image:-webkit-linear-gradient(rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);background-size:20px 20px;"
    },
    "tbaSeen": {
        "cssText": "background-color:rgba(0, 170, 238, 0.8);color:rgb(0, 0, 0);"
    },
    "completedUnseen": {
        "cssText": "background-color:#f90;background-image:-webkit-linear-gradient(0deg, rgba(255, 255, 255, .2) 50%, transparent 50%, transparent);background-size:20px 20px;"
    },
    "completedSeen": {
        "cssText": "background-color:rgba(255, 153, 0, 0.8);color:rgb(0, 0, 0);"
    }
},

*/
