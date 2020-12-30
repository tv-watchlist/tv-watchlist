import { ChangeDetectorRef, SimpleChange } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IMyTvQShow, IMyTvQShowEpisode, UiEpisodeModel } from '../../services/model';
import { EpisodeService, ShowService } from '../../services/show.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'tvq-show-detail',
    templateUrl: 'show-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowDetailComponent implements OnInit {
    constructor(
        private cdRef: ChangeDetectorRef,
        private showSvc: ShowService,
        private episodeSvc: EpisodeService,
        private activatedRoute: ActivatedRoute,
        private datePipe: DatePipe
    ) { }

    show!: IMyTvQShow;
    showDetails = false;
    episodeList: {[season: number]: UiEpisodeModel[]} = {};
    seasonNumList: any[] = [];
    openSeason!: number;
    highLightNextEpisode!: string;
    totalEpisodes = 0;
    private toggleViewState: {[state: string]: boolean} = {};
    seasonOrderAsc = true;
    episodeOrderAsc = true;
    selectedSeasonNum = 1;
    ngOnInit(): void {
        this.activatedRoute.params.subscribe((p) => {
            this.show = this.showSvc.shows.get(p.showId) as IMyTvQShow;
            const today = new Date().getTime();
            this.seasonNumList.length = 0;
            this.clearObj(this.episodeList);
            const season = 0;
            let isUnairedFlagSet = false;
            this.openSeason = 0;
            this.highLightNextEpisode = '';
            this.totalEpisodes = 0;
            const globalSettings = this.showSvc.settings;
            console.log('globalSettings', globalSettings);
            const timezoneOffset = globalSettings.timezone_offset || {};

            const episodeList: {[season: number]: UiEpisodeModel[]} = {};
            for (const episodeId in this.show.episode_list) {
                if (Object.prototype.hasOwnProperty.call(this.show.episode_list, episodeId)) {
                    const episode = this.show.episode_list[episodeId];
                    const uiModel: UiEpisodeModel = {
                        id: episode.episode_id,
                        episodeName: this.episodeSvc.getEpisodeName(episode),
                        dateFormatted: '',
                        summary: episode.summary,
                        isUnaired: false,
                        image: Array.isArray(episode.image?.poster) ? episode.image?.poster[0] : episode.image?.poster ,
                        seen: episode.seen,
                        expand: false,
                    };
                    if (!isUnairedFlagSet && episode.local_showtime > today) {
                        this.openSeason = episode.season;
                        this.highLightNextEpisode = episode.episode_id;
                    }
                    if (episode.local_showtime > today) {
                        // this.episodeList.push({"type":"label", "text":`**UNAIRED**`});
                        isUnairedFlagSet = true;
                        uiModel.isUnaired = true;
                    }

                    if (episode.local_showtime) {
                        const offsetNextDate = new Date(episode.local_showtime);
                        if (this.show?.channel?.country && timezoneOffset[this.show.channel.country.name]) {
                            offsetNextDate.setMinutes(offsetNextDate.getMinutes() +
                                (60 * Number(timezoneOffset[this.show.channel.country.name])));
                        }
                        // Sat 1:25 PM, Jul 23rd, 2016
                        if (isUnairedFlagSet) {
                            uiModel.dateFormatted = this.datePipe.transform(offsetNextDate, 'EEE hh:mm a, MMM dd, y') || 'n/a';
                        } else {
                            uiModel.dateFormatted = this.datePipe.transform(offsetNextDate, 'MMM dd, y') || 'n/a';
                        }
                    } else {
                        uiModel.dateFormatted = '(n/a)';
                    }

                    uiModel.summary = episode.summary;


                    if (!episodeList[episode.season]) {
                        episodeList[episode.season] = [];
                        this.toggleViewState['buttonSeason' + episode.season] = false;
                    }
                    if (!isUnairedFlagSet) {
                        this.totalEpisodes++;
                    }
                    this.toggleViewState['buttonEpisode' + episode.episode_id] = false;

                    episodeList[episode.season].push(uiModel);
                }
            }

            this.seasonNumList = Object.keys(episodeList);
            if (!this.seasonOrderAsc) {
                this.seasonNumList.reverse();
            }
            this.episodeList = episodeList;
            this.show.total_episodes = this.totalEpisodes;
            console.log('ngOnChanges', this.show, this.seasonNumList, this.episodeList);

            this.cdRef.markForCheck();
        });
    }

    clearObj(object: any): void {
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                delete object[key];
            }
        }
    }

    getKeys(obj: any): string[] {
        if (obj) {
            return Object.keys(obj);
        }
        else {
            return [];
        }
    }

    setToggleState(field: string, val: string, state: boolean): void {
        // console.log(field,val,state);
        this.toggleViewState[field + val] = state;
    }

    getToggleState(field: string, val: string|number): boolean {
        return this.toggleViewState[field + val];
    }

    setToggleSeen(season: number, episode: any): void {
        // const ep = this.show.episode_list[episode.id];
        // ep.seen = !ep.seen;

        // const arr = this.episodeList[season].filter((obj: any) => {
        //     return obj.id === episode.id;
        // });
        // arr[0].seen = !arr[0].seen;
    }

    setSeasonSeen(season: number): void {
        // let block = false;
        // this.episodeList[season].forEach((episode: any) => {
        //     if (this.highLightNextEpisode === episode.id) {
        //         block = true;
        //     }
        //     if (block) {
        //         return;
        //     }

        //     episode.seen = true;
        //     const ep = this.show.episode_list[episode.id];
        //     ep.seen = true;
        //     episode.text = this.getEpisodeName(ep);
        // });
    }
}
