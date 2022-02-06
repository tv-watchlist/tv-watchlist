
export interface IMyTvQFlatV5 {
    data_structure_version: number;
    settings: IMyTvQSettingFlatV5;
    show_list: IMyTvQShowFlatV5[];
}

export interface IMyTvQSettingFlatV5 {
    advanced_css_hack: number;
    animate_icon: number;
    badge_flag: string;
    compact_flag: number;
    default_country: string;
    enable_banner: number;
    enable_notification: number;
    listings_next_update_date: number;
    override_episode_summary_link: string;
    schedules_next_update_date_US: number;
    custom_shows_order: string[];
    shows_order: string;
    shows_update_frequency: number;
    ui: IMyTvQUiSettingFlatV5;
    update_time: number;
    timezone_offset: { [country: string]: number };
    hide_tba: boolean;
    hide_seen: boolean;
    default_episodes: string;
}

export interface IMyTvQUiSettingFlatV5 {
    runningUnseen: IMyTvQUiSettingCssFlatV5;
    runningSeen: IMyTvQUiSettingCssFlatV5;
    tbaUnseen: IMyTvQUiSettingCssFlatV5;
    tbaSeen: IMyTvQUiSettingCssFlatV5;
    completedUnseen: IMyTvQUiSettingCssFlatV5;
    completedSeen: IMyTvQUiSettingCssFlatV5;
}

export interface IMyTvQUiSettingCssFlatV5 {
    cssText: string;
}

export interface IMyTvQShowFlatV5 {
    show_id: string;
    next_update_time: number;
    name: string;
    url: string;
    show_type: string;
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
    user_rating: {
        average: number;
        count: number
    };
    content_rating: string;
    channel: {
        id: number;
        name: string;
        country: {
            name: string;
            code: string;
            timezone: string;
        }
    };
    api_source: string;
    api_id: { [key: string]: string | number };
    image: {
        banner: string[];
        poster: string[];
    };
    unseen_count: number;
    total_episodes: number;
    first_episode: IMyTvQShowEpisodeFlatV5;
    previous_episode: IMyTvQShowEpisodeFlatV5;
    next_episode: IMyTvQShowEpisodeFlatV5;
    last_episode: IMyTvQShowEpisodeFlatV5;
    episode_list: { [episodeId: string]: IMyTvQShowEpisodeFlatV5 };
}

// tvmaze5027_0024_0001_0024S02:
// tvmaze5027_0024_0002_0024S01:
// tvmaze5027_0025_0001_0001S03:
// newShow.show_id + "_" + nsr.ZeroPad(normal_counter,4) + "_" + nsr.ZeroPad(newEpisode.season, 4) + "_" + nsr.ZeroPad(last_number, 4);
// Special newShow.show_id + "_" + nsr.ZeroPad(normal_counter,4) + "_" + nsr.ZeroPad(newEpisode.season, 4) + "_" + nsr.ZeroPad(last_number, 4) + "S"+nsr.ZeroPad(special_counter, 2)
export interface IMyTvQShowEpisodeFlatV5 {
    // {show_id}_{season}_{number}_{counter}
    // {show_id}_{season}_{number}_{counter}
    episode_id: string;
    show_id: string;
    local_showtime: number;
    name: string;
    url: string;
    iso8601: string | Date;
    production_code: string;
    runtime: number;
    season: number;
    number: number;
    counter: number;
    special: boolean;
    guest_stars: string;
    director: string;
    writer: string;
    summary: string;
    image: {
        banner: string[];
        poster: string[];
    };
    seen: boolean;
    previous_id: string;
    next_id: string;
    api_source: string;
    api_id: { [key: string]: string | number };
}

