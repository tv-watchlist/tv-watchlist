import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { SettingService } from './setting.service';
import { UiShowModel } from './ui.model';
import { EpisodeService } from './episode.service';
import { IMyTvQDbEpisode, IMyTvQDbShow } from './db.model';
import { WebDatabaseService } from './web-database.service';
import { IMyTvQShowFlatV5 } from './flat-file-v5.model';

@Injectable({ providedIn: 'root' })
export class ShowService {
    constructor(
        private settingSvc: SettingService,
        private episodeSvc: EpisodeService,
        private webDb: WebDatabaseService,
        private commonSvc: CommonService
    ) { }

    private EndedRegex = /Pilot.?Rejected|Cancell?ed\/Ended|Cancell?ed|Ended/i;

    public async getAll() {
        return await this.webDb.getAllAsArray<IMyTvQDbShow>('shows');
    }

    public async saveFileToDb(showList: IMyTvQShowFlatV5[]) {
        const list = showList.map(e => {
            // IMyTvQDbShow
            const show: IMyTvQDbShow = {
                showId: e.show_id,
                name: e.name,
                url: e.url,
                runtime: e.runtime,
                summary: e.summary,
                showType: e.show_type,
                language: e.language,
                genres: e.genres,
                cast: e.cast,
                contentRating:e.content_rating,
                premiered: e.premiered,
                nextUpdateTime: e.next_update_time,
                schedule: e.schedule,
                userRating:e.user_rating,
                status: e.status,
                channel: {name: e.channel.name, country: e.channel.country},
                image: e.image,
                apiSource: e.api_source,
                apiId: e.api_id,

                unseenCount: 0,
                totalEpisodes: 0,
                totalSeasons: 0,
                pastEpisode: undefined,
                futureEpisode: undefined,
            };
            return show;
        });
        await this.webDb.putList('shows', list);
    }

    public async save(show:IMyTvQDbShow) {
        await this.webDb.putObj('shows', show);
    }

    async getShowModel(showId: string) {
        // this.webDb
        const show = await this.getShow(showId);

        const latestEpisode = show.futureEpisode || show.pastEpisode;

        const model = new UiShowModel(show);
        model.status = this.getShowStatus(show);
        if(!!latestEpisode) {
            model.latestEpisodeName = this.episodeSvc.getEpisodeName(latestEpisode) || 'TBA';
            model.latestEpisodeDateFormatted = this.episodeSvc.getFormattedTime(latestEpisode.localShowTime, model.status);
            model.latestEpisodeInDays = this.episodeSvc.getNextEpisodeDays(latestEpisode);
        }
        model.unseenEpisodeName = this.episodeSvc.getEpisodeName(show.unseenEpisode);
        return model;
    }

    async updateAllShowReference() {
        console.log('Updating show references...starting!');
        let showList = await this.getAll();
        const settings = await this.settingSvc.getAll();
        showList.forEach(async show => {
            const episodes = await this.episodeSvc.getEpisodeList(show.showId);
            // update show episode ref
            this.updateReference(show, episodes);
            await this.webDb.putObj('shows', show);
        });

        if (settings.hideTba) {
            showList = showList.filter(o => !!o && (o.unseenCount > 0 || !!o.futureEpisode));
        }

        let showIdOrder: string[] = [];
        if (settings.showsOrder === 'showname') {
            // http://www.javascriptkit.com/javatutors/arraysort2.shtml
            if (showList.length) {
                showList.sort((a, b) => {
                    const x = a.name.toLowerCase();
                    const y = b.name.toLowerCase();
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }
        }
        else {
            // unseen or default airdate

            // get future shows && sort by asc
            const futureShowList = showList.filter((item) => {
                return !!item.futureEpisode;
            }).sort((a, b) => {
                const x = a.futureEpisode?.localShowTime || 0;
                const y = b.futureEpisode?.localShowTime || 0;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            // tba && sort by desc
            const tbaShowList = showList.filter((item) => {
                return !(item.status || '').match(this.EndedRegex) && !item.futureEpisode;
            }).sort((a, b) => {
                const x = b.pastEpisode?.localShowTime || 0;
                const y = a.pastEpisode?.localShowTime || 0;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            // console.log(tba_show_list);
            // completed && sort by desc
            const endedShowList = showList.filter((item, index) => {
                return (item.status || '').match(this.EndedRegex);
            }).sort((a, b) => {
                const x = b.pastEpisode?.localShowTime || 0;
                const y = a.pastEpisode?.localShowTime || 0;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });

            const tbaEnded = tbaShowList.concat(endedShowList);

            let newShowList = futureShowList.concat(tbaEnded);

            // Acecool - Add a new type of sorting...
            if(settings.showsOrder === 'unseen_my_popular') {
                const DayInMilliSeconds = 24 * 60 * 60 * 1000;
                // Acecool - How many seconds ahead of the shows' next-episode airtime before we prioritize that show and display it at the top of the unseen shows list ( all the way at the top )
                // Note: Popular means it is either a NEW show with 0 aired, or you've seen ALL of the aired episodes meaning this will put the show at the very top of the list if 0 unseen and x hours before airtime...
                //	   and at air-time, it'll be removed from the very top and it'll be at the very top anyway because it'll have 1 unseen episode...
                const TimeBeforeAirToPrioritizePopularShow = DayInMilliSeconds;
                // - Modify this helper function to ensure upcoming shows
                // - which have been fully-watched to 0 eps un-seen except unaired
                // - are added to the unseen list. Shows with an air-date less than 24 hours from the current timestamp are added to the top of the list!
                const showListUnseen = newShowList.filter(show => {
                    // // If show is special, don't add it...
                    // if ( show.special ) { // not applicable
                    //     return false;
                    // }
                    // Grab the next episode data in the double linked-list, if applicable..
                    const nextEpisode = show.futureEpisode || show.unseenEpisode;

                    // If there is a next episode with a name airing within the next day from a show which has no unseen aired episodes
                    // ( Meaning it is either brand-new OR we follow this show carefully ) - ADD IT TO THE UNSEEN LIST AT THE TOP -
                    // I could also mod it to appear after shows with 1 ep unseen, or 2 to help fit my no-scrolling criteria for the mods,
                    // but the shows that air on the same day aren't many, typically...
                    if ( !!nextEpisode && nextEpisode.name && !nextEpisode.seen ) {
                        const now = new Date().getTime();

                        if ( (nextEpisode.localShowTime - now) < TimeBeforeAirToPrioritizePopularShow ){
                            // Debugging - Show the developer or curious user which unaired,
                            // fully-watched or new show / episode is going to appear at the top of the list...
                            console.log( '[ UnAired added to Unseen List ] Show: ' + show.name + ' - ' + ( show.futureEpisode?.name || "Unknown Episode Name" ) +
                                '\t\t( showtime: ' + nextEpisode.localShowTime + ' - tnow: ' + now + ' ) = ' + ( (nextEpisode.localShowTime - now)/1000 ) + 'seconds until airtime...' );

                            // Return true to ensure it is added to the unseen episodes list
                            // - it will also appear in the other list in order with other upcoming shows...
                            return true;
                        }
                    }
                    return show.unseenCount > 0;
                }).sort((a, b) => {
                    const x = b.unseenCount;
                    const y = a.unseenCount;
                    // Acecool - Sort Ascending - ie the fewest episodes left to watch appear at the top because these are shows you pay more attention
                    // to or have gotten around to watching vs other shows with hundreds of episodes you haven't started with yet...
                    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
                });

                const showListSeen = newShowList.filter(show => {
                    return show.unseenCount === 0;
                });
                newShowList = showListUnseen.concat(showListSeen);
            }

            if (settings.showsOrder === 'unseen') {
                const showListUnseen = newShowList.filter(show => {
                    return show.unseenCount > 0;
                }).sort((a, b) => {
                    const x = b.unseenCount;
                    const y = a.unseenCount;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });

                const showListSeen = newShowList.filter(show => {
                    return show.unseenCount === 0;
                });
                newShowList = showListUnseen.concat(showListSeen);
            }
            showIdOrder = newShowList.map(o => o.showId);
        }

        this.settingSvc.save('showIdOrderList', showIdOrder);
        console.log('Updating show references...complete!');
    }

    async updateShowReference(showId: string) {
        const show = await this.getShow(showId);
        const episodeList = await this.episodeSvc.getEpisodeList(showId);
        this.updateReference(show, episodeList);
        await this.webDb.putObj('shows', show);
    }

    updateReference(show: IMyTvQDbShow, episodeList:IMyTvQDbEpisode[]) {
        // console.log(show,episodeList);
        const now = (new Date()).getTime();
        let unseenCount = 0;
        show.futureEpisode = undefined;
        show.pastEpisode = undefined;
        show.unseenEpisode = undefined;

        episodeList.forEach((episode,index,array) => {
            if (!!episode.localShowTime && episode.localShowTime < now) {
                show.pastEpisode = episode;
            } else  if (!show.futureEpisode && !!episode.localShowTime && episode.localShowTime >= now) {
                show.futureEpisode = episode;
            }

            if (!!episode.localShowTime && episode.localShowTime < now && !episode.seen) {
                unseenCount++;
                if (index === 0 || (index > 0 && array[index - 1].seen)) {
                    show.unseenEpisode = episode;
                }
            }
        });
        show.totalSeasons = (show.futureEpisode || show.pastEpisode || {season:0}).season;
        show.totalEpisodes = episodeList.length;
        show.unseenCount = unseenCount;
    }

    async getShow(showId: string): Promise<IMyTvQDbShow> {
        return await this.webDb.getObj('shows', showId)!;
    }

    getShowIdFromEpisode(episodeId: string): string {
        return episodeId.split('_')[0];
    }

    async getShowByEpisodeId(episodeId: string): Promise<IMyTvQDbShow> {
        const showId = episodeId.split('_')[0];
        return await this.getShow(showId);
    }

    /**
     * -1 Completed
     * 0 Running
     * 1 TBA
     * @param show
     * @returns
     */
    getShowStatus(show: IMyTvQDbShow): -1 | 0 | 1 {
        if ((show.status || '').match(this.EndedRegex)) {
            return -1; // Completed
        }
        const episode = show.futureEpisode || show.pastEpisode;

        // console.log(show, episode);
        const now = new Date().getTime();
        if (!!episode && !!episode.localShowTime && episode.localShowTime > now) {
            return 0; // Running
        }
        else {
            return 1; // TBA
        }
    }

    removeShow(showId: string): void {
        this.webDb.deleteObj('shows',showId);
        this.webDb.deleteRange('episodes','showIdIndex',this.webDb.getKeyRange('=',showId));
        this.settingSvc.get<string[]>('showIdOrderList').then(showIdOrder => {
            showIdOrder.splice(showIdOrder.findIndex(o => o === showId), 1);
            this.settingSvc.save('showIdOrderList',showIdOrder);
        });
        // TODO: remove from other places too
    }

    async markAsSeen(show: IMyTvQDbShow, nextEpisodeId: string): Promise<void> {
        await this.episodeSvc.toggleSeen(nextEpisodeId, true); // marks episode seen
        const seenEpisode = await this.episodeSvc.getEpisode(nextEpisodeId);
        const nextUnseenEpisode = await this.episodeSvc.getEpisode(seenEpisode.nextId);

        show.unseenEpisode = nextUnseenEpisode;

        if (show.unseenCount > 0) {
            show.unseenCount = show.unseenCount - 1;
        }
        await this.webDb.putObj('shows',show);
    }
}
