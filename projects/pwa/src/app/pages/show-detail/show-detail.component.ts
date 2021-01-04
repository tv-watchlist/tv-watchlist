import { ChangeDetectorRef, SimpleChange, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IMyTvQShow, IMyTvQShowEpisode, UiEpisodeModel } from '../../services/model';
import { CommonService, EpisodeService, SettingService, ShowService } from '../../services/show.service';
import { ActivatedRoute, Router } from '@angular/router';
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
        private commonSvc: CommonService,
        private activatedRoute: ActivatedRoute,
        private settingSvc: SettingService,
        private router: Router,
    ) { }
    @ViewChild('menu') menu!: OptionsMenuComponent;

    showDetails = false;
    menuOptions = ['Bookmarked', 'Latest'];
    defaultMenuOption: 'Bookmarked' | 'Latest' = 'Bookmarked';
    private pHideSeen: undefined|boolean;
    get hideSeen(): boolean {
        return this.pHideSeen === undefined ? this.settingSvc.hideSeen : this.pHideSeen;
    }
    set hideSeen(val: boolean) {
        this.pHideSeen = val;
    }
    show!: IMyTvQShow;
    episodeList: {[season: number]: string[]} = {};
    seasonUnSeen: {[season: number]: number} = {};
    seasonTotal: {[season: number]: number} = {};
    seasonNumList: any[] = [];
    latestEpisodeId!: string;
    nextUnseenEpisodeId!: string;
    selectedSeasonNum!: number;

    ngOnInit(): void {
        this.activatedRoute.params.subscribe((p) => {
            this.show = this.showSvc.getShow(p.showId) as IMyTvQShow;
            if (this.show) {
                this.populateEpisodeList();
                console.log('ngOnChanges', this.show, this.seasonNumList, this.episodeList);
            }

            this.cdRef.markForCheck();
        });
    }

    populateEpisodeList(): void {
        const today = new Date().getTime();
        this.seasonNumList.length = 0;
        this.commonSvc.clearObj(this.episodeList);
        let isUnairedFlagSet = false;
        this.selectedSeasonNum = 0;
        this.nextUnseenEpisodeId = '';
        this.latestEpisodeId = '';
        let totalEpisodes = 0;

        const episodeList: {[season: number]: string[]} = {};
        for (const episodeId in this.show.episode_list) {
            if (Object.prototype.hasOwnProperty.call(this.show.episode_list, episodeId)) {
                const episode = this.show.episode_list[episodeId];

                if (!isUnairedFlagSet && !this.latestEpisodeId && episode.local_showtime > today) {
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
                    this.seasonUnSeen[episode.season] = 0;
                    this.seasonTotal[episode.season] = 0;
                }

                if (!isUnairedFlagSet) {
                    totalEpisodes++;
                }

                if (!this.nextUnseenEpisodeId && !this.nextUnseenEpisodeId && !episode.seen) {
                    if (this.defaultMenuOption === 'Bookmarked') {
                        this.selectedSeasonNum = episode.season;
                    }
                    this.nextUnseenEpisodeId = episode.episode_id;
                }
                if ((this.hideSeen && !episode.seen) || !this.hideSeen) {
                    episodeList[episode.season].push(episode.episode_id);
                }
                this.seasonTotal[episode.season]++;
                if (!episode.seen) {
                    this.seasonUnSeen[episode.season]++;
                }
            }
        }
        this.show.total_episodes = totalEpisodes;
        this.seasonNumList = Object.keys(episodeList);
        if (this.selectedSeasonNum === 0) {
            this.selectedSeasonNum = this.seasonNumList[this.seasonNumList.length - 1];
        }
        this.episodeList = episodeList;
    }

    goToUrl(): void {
        window.open(this.show.url, '_blank');
    }

    removeShow(): void {
        this.showSvc.removeShow(this.show.show_id);
        this.router.navigate(['/home']);
    }

    displayHidden(): void {
        this.hideSeen = !this.hideSeen;
        this.populateEpisodeList();
    }

    toggleSeasonSeen(): void {
        for (const episodeId of this.episodeList[this.selectedSeasonNum]) {
            const episode = this.showSvc.getEpisode(episodeId);
            if (!!episode) {
                episode.seen = true;
            }
        }
        this.populateEpisodeList();
    }

    episodeToggled(seen: boolean): void {
        console.log('episodeToggled', seen, this.seasonUnSeen[this.selectedSeasonNum]);
        if (seen) {
            this.seasonUnSeen[this.selectedSeasonNum]--;
        } else {
            this.seasonUnSeen[this.selectedSeasonNum]++;
        }
        // if all seen then repopulate
        if (!this.seasonUnSeen[this.selectedSeasonNum]) {
            this.populateEpisodeList();
        }
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
