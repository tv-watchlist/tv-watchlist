import { ChangeDetectorRef, SimpleChange, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IMyTvQShow, IMyTvQShowEpisode, UiEpisodeModel } from '../../services/model';
import { CommonService, EpisodeService, ShowService } from '../../services/show.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { OptionsMenuComponent } from '../../widgets/options-menu/options-menu.component';

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
        private commonSvc: CommonService,
        private activatedRoute: ActivatedRoute,
        private datePipe: DatePipe
    ) { }
    @ViewChild('menu') menu!: OptionsMenuComponent;

    showDetails = false;
    showMenu = false;
    menuOptions = ['Bookmarked', 'Latest'];
    defaultMenuOption: 'Bookmarked' | 'Latest' = 'Bookmarked';

    show!: IMyTvQShow;
    episodeList: {[season: number]: string[]} = {};
    seasonNumList: any[] = [];
    latestEpisodeId!: string;
    nextUnseenEpisodeId!: string;
    totalEpisodes!: number;
    selectedSeasonNum!: number;

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((p) => {
            this.show = this.showSvc.getShow(p.showId) as IMyTvQShow;
            const today = new Date().getTime();
            this.seasonNumList.length = 0;
            this.commonSvc.clearObj(this.episodeList);
            const season = 0;
            let isUnairedFlagSet = false;
            this.selectedSeasonNum = 0;
            this.nextUnseenEpisodeId = '';
            this.latestEpisodeId = '';
            this.totalEpisodes = 0;

            const episodeList: {[season: number]: string[]} = {};
            for (const episodeId in this.show.episode_list) {
                if (Object.prototype.hasOwnProperty.call(this.show.episode_list, episodeId)) {
                    const episode = this.show.episode_list[episodeId];

                    if (!isUnairedFlagSet && episode.local_showtime > today) {
                        if (this.defaultMenuOption === 'Latest') {
                            this.selectedSeasonNum = episode.season;
                        }
                        this.latestEpisodeId = episode.episode_id;
                    }
                    if (episode.local_showtime > today) {
                        // this.episodeList.push({"type":"label", "text":`**UNAIRED**`});
                        isUnairedFlagSet = true;
                    }

                    if (!episodeList[episode.season]) {
                        episodeList[episode.season] = [];
                    }

                    if (!isUnairedFlagSet) {
                        this.totalEpisodes++;
                    }

                    if (!this.nextUnseenEpisodeId && !episode.seen) {
                        if (this.defaultMenuOption === 'Bookmarked') {
                            this.selectedSeasonNum = episode.season;
                        }
                        this.nextUnseenEpisodeId = episode.episode_id;
                    }

                    episodeList[episode.season].push(episode.episode_id);
                }
            }

            this.seasonNumList = Object.keys(episodeList);
            if (this.selectedSeasonNum === 0) {
                this.selectedSeasonNum = this.seasonNumList[this.seasonNumList.length - 1];
            }
            // if (!this.seasonOrderAsc) {
            //     this.seasonNumList.reverse();
            // }
            this.episodeList = episodeList;
            this.show.total_episodes = this.totalEpisodes;
            console.log('ngOnChanges', this.show, this.seasonNumList, this.episodeList);

            this.cdRef.markForCheck();
        });
    }

    goToUrl(): void {
        window.open(this.show.url, '_blank');
    }

    more(): void {
        this.menu.openMenu();
    }

    onMenuSelect(option: string | null): void {
        if (!!option) {
            this.defaultMenuOption = option as any;
            let episode;
            if (this.defaultMenuOption === 'Latest') {
                episode = this.show.episode_list[this.latestEpisodeId];
                this.selectedSeasonNum = episode.season;
            }
            if (this.defaultMenuOption === 'Bookmarked') {
                episode = this.show.episode_list[this.nextUnseenEpisodeId];
                this.selectedSeasonNum = episode.season;
            }
        }
    }
}
