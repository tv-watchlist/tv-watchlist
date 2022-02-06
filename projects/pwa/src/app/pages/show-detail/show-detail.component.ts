import { ChangeDetectorRef, SimpleChange, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
// import { IMyTvQShowFlatV5 } from '../../services/flat-file-v5.model';
import { SettingService } from '../../services/setting.service';
import { ShowService } from '../../services/show.service';
import { EpisodeService } from '../../services/episode.service';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OptionsMenuComponent } from '../../widgets/options-menu/options-menu.component';
import { UiShowModel } from '../../services/ui.model';
import { IMyTvQDbEpisode } from '../../services/db.model';

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
        private settingSvc: SettingService,
        private episodeSvc: EpisodeService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) { }

    @ViewChild('menu') menu!: OptionsMenuComponent;

    showDetails = false;
    menuOptions = ['Bookmarked', 'Latest'];
    defaultMenuOption: 'Bookmarked' | 'Latest' = 'Bookmarked';
    private pHideSeen!: boolean;
    get hideSeen(): boolean {
        return this.pHideSeen || false;
    }
    set hideSeen(val: boolean) {
        this.pHideSeen = val;
    }

    showId = '';
    showModel!: UiShowModel;
    episodeDictionary: {[episodeId: string]: IMyTvQDbEpisode} = {};
    episodeList: {[season: number]: string[]} = {};

    seasonUnSeen: {[season: number]: number} = {};
    seasonTotal: {[season: number]: number} = {};
    seasonNumList: any[] = [];
    latestEpisodeId!: string;
    nextUnseenEpisodeId!: string;
    selectedSeasonNum!: number;

    async ngOnInit(): Promise<void> {
        this.activatedRoute.params.subscribe(async (p) => {
            this.showId = p.showId;
            this.showModel = await this.showSvc.getShowModel(p.showId);
            this.episodeDictionary = await this.episodeSvc.getEpisodeDictionary(p.showId);
            this.pHideSeen = await this.settingSvc.get('hideSeen');
            this.populateEpisodeList();
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
        for (const episodeId in this.episodeDictionary ) {
            if (Object.prototype.hasOwnProperty.call(this.episodeDictionary, episodeId)) {
                const episode = this.episodeDictionary[episodeId];

                if (!isUnairedFlagSet && !this.latestEpisodeId && episode.localShowTime > today) {
                    if (this.defaultMenuOption === 'Latest') {
                        this.selectedSeasonNum = episode.season;
                    }
                    this.latestEpisodeId = episode.episodeId;
                }
                if (episode.localShowTime > today) {
                    // this.episodeList.push({'type':'label', 'text':`**UNAIRED**`});
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
                    this.nextUnseenEpisodeId = episode.episodeId;
                }
                if ((this.hideSeen && !episode.seen) || !this.hideSeen) {
                    episodeList[episode.season].push(episode.episodeId);
                }
                this.seasonTotal[episode.season]++;
                if (!episode.seen) {
                    this.seasonUnSeen[episode.season]++;
                }
            }
        }
        this.showModel.totalEpisodes = totalEpisodes;
        if(!!this.showModel) {
            this.showModel.totalSeasons = this.seasonNumList.length;
        }
        this.seasonNumList = Object.keys(episodeList);
        if (this.selectedSeasonNum === 0) {
            this.selectedSeasonNum = this.seasonNumList[this.seasonNumList.length - 1];
        }
        this.episodeList = episodeList;
    }

    goToUrl(): void {
        if (this.showModel) {
            window.open(this.showModel.url, '_blank');
        }
    }

    removeShow(): void {
        this.showSvc.removeShow(this.showId);
        this.router.navigate(['/home']);
    }

    displayHidden(): void {
        this.hideSeen = !this.hideSeen;
        this.populateEpisodeList();
    }

    toggleSeasonSeen(): void {
        this.episodeSvc.toggleBulkSeen( this.episodeList[this.selectedSeasonNum], true);
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
            const show = this.showSvc.getShow(this.showId);
            let episode;
            if (this.defaultMenuOption === 'Latest') {
                episode = this.episodeDictionary[this.latestEpisodeId];
                this.selectedSeasonNum = episode.season;
            }
            if (this.defaultMenuOption === 'Bookmarked') {
                episode = this.episodeDictionary[this.nextUnseenEpisodeId];
                this.selectedSeasonNum = episode.season;
            }
        }
    }
}
