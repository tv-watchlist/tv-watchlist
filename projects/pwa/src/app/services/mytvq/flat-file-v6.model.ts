import { IMyTvQDbSetting, IMyTvQDbShow, IMyTvQDbEpisode } from "../storage/db.model";

export interface IMyTvQFlatV6 {
    data_structure_version: 6;
    settings: IMyTvQDbSetting;
    show_list: IMyTvQDbShow[],
    episode_list: IMyTvQDbEpisode[];
}
