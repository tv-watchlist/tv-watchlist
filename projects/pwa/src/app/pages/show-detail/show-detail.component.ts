import { ChangeDetectorRef, SimpleChange, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { EpisodeService } from '../../services/mytvq/episode.service';
import { CommonService } from '../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OptionsMenuComponent } from '../../widgets/options-menu/options-menu.component';
import { SettingService } from '../../services/mytvq/setting.service';
import { ShowService } from '../../services/mytvq/show.service';
import { UiShowModel } from '../../services/mytvq/ui.model';
import { IMyTvQDbEpisode } from '../../services/storage/db.model';
import { LoaderScreenService } from '../../widgets/loader/loader-screen.service';

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
        private loaderSvc: LoaderScreenService,
        private activatedRoute: ActivatedRoute,
    ) { }

    @ViewChild('menu') menu!: OptionsMenuComponent;

    public showDetails = false;
    public menuOptions = ['Bookmarked', 'Latest'];
    public defaultMenuOption: 'Bookmarked' | 'Latest' = 'Bookmarked';
    private pHideSeen!: boolean;
    public get hideSeen(): boolean {
        return this.pHideSeen || false;
    }

    /**
     * Temp override hideSeen
     */
    public set hideSeen(val: boolean) {
        this.pHideSeen = val;
    }

    private showId = '';

    private episodeDictionary: {[episodeId: string]: IMyTvQDbEpisode} = {};
    /**
     * List of episodeId to loop over per season for the UI
     */
    public episodeList: {[season: number]: {episodeId: string; seen:boolean}[]} = {};

    /**
     * total unseen episodes in a season
     */
    public seasonUnSeen: {[season: number]: number} = {};
    /**
     * total episodes in a season
     */
    public seasonTotal: {[season: number]: number} = {};
    public seasonNumList: any[] = [];
    public latestEpisodeId!: string;
    public nextUnseenEpisodeId!: string;
    public selectedSeasonNum!: number;
    public showModel!: UiShowModel;

    async ngOnInit(): Promise<void> {
        this.loaderSvc.show();
        this.activatedRoute.params.subscribe(async (p) => {
            this.showId = p.showId;
            this.pHideSeen = await this.settingSvc.get('hideSeen');
            await this.populateEpisodeList();
            this.loaderSvc.close();
        });
    }

    async populateEpisodeList(): Promise<void> {
        this.showModel = await this.showSvc.getShowModel(this.showId);
        this.episodeDictionary = await this.episodeSvc.getEpisodeDictionary(this.showId);

        const today = new Date().getTime();
        this.seasonNumList.length = 0;
        this.commonSvc.clearObj(this.episodeList);
        let isUnairedFlagSet = false;
        this.selectedSeasonNum = 0;
        this.nextUnseenEpisodeId = '';
        this.latestEpisodeId = '';
        let totalEpisodes = 0;

        const episodeList: {[season: number]: {episodeId: string; seen:boolean}[]} = {};
        for (const episodeId in this.episodeDictionary ) {
            if (Object.prototype.hasOwnProperty.call(this.episodeDictionary, episodeId)) {
                const episode = this.episodeDictionary[episodeId];

                if (!isUnairedFlagSet && !this.latestEpisodeId && (episode.localShowTime||0) > today) {
                    if (this.defaultMenuOption === 'Latest') {
                        this.selectedSeasonNum = episode.season;
                    }
                    this.latestEpisodeId = episode.episodeId;
                }
                if ((episode.localShowTime||0) > today) {
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
                    episodeList[episode.season].push({episodeId:episode.episodeId, seen:episode.seen});
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
        this.cdRef.markForCheck();
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

    async setSeasonAsSeen(): Promise<void> {
        const list = this.episodeList[this.selectedSeasonNum].map(o=>o.episodeId);
        await this.episodeSvc.toggleBulkSeen(list, true);
        const lastWatchedTime = new Date().getTime();
        await this.showSvc.updateShowReference(this.showId, {lastWatchedTime});
        this.seasonUnSeen[this.selectedSeasonNum] = 0;
        await this.populateEpisodeList();
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
    async refresh() {
       const show = await this.showSvc.getShow(this.showId);
       await this.showSvc.addUpdateTvMazeShow(show.apiSource, show.apiId[show.apiSource] as string);
       location.reload();
    }
}
