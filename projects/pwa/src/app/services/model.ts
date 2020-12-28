import { BuiltinMethod } from "@angular/compiler";

export interface IMyTvQ {
    data_structure_version: number;
    settings: IMyTvQSetting;
    show_list: IMyTvQShow[];
}

export interface IMyTvQSetting {
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
    ui: IMyTvQUiSetting;
    update_time: number;
    timezone_offset: {[country: string]: number};
}

export interface IMyTvQUiSetting
{
    runningUnseen: IMyTvQUiSettingCss;
    runningSeen: IMyTvQUiSettingCss;
    tbaUnseen: IMyTvQUiSettingCss;
    tbaSeen: IMyTvQUiSettingCss;
    completedUnseen: IMyTvQUiSettingCss;
    completedSeen: IMyTvQUiSettingCss;
}

export interface IMyTvQUiSettingCss {
    cssText: string;
}

export interface IMyTvQShow {
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
    api_id: {[key: string]: string|number};
    image: {
        banner: string[];
        poster: string[];
    };
    unseen_count: number;
    total_episodes: number;
    first_episode: IMyTvQShowEpisode;
    previous_episode: IMyTvQShowEpisode;
    next_episode: IMyTvQShowEpisode;
    last_episode: IMyTvQShowEpisode;
    episode_list: {[episodeId: string]: IMyTvQShowEpisode};
}

export interface IMyTvQShowEpisode
{
    episode_id: string;
    show_id: string;
    local_showtime: number;
    name: string;
    url: string;
    iso8601: string|Date;
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
        poster: string | string[];
    };
    seen: boolean;
    previous_id: string;
    next_id: string;
    api_source: string;
    api_id: {[key: string]: string|number};
}
