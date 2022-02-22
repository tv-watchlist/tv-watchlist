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
import { ToastService } from '../../widgets/toast/toast.service';

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
        private toastSvc: ToastService,
    ) { }

    @ViewChild('menu') menu!: OptionsMenuComponent;

    public showDetails = false;
    public menuOptions = ['Seen', 'Latest'];
    public defaultMenuOption: 'Seen' | 'Latest' = 'Seen';
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
            const defaultMenuOption = await this.settingSvc.get('episodesOrder');
            this.defaultMenuOption = defaultMenuOption === 'latest'? 'Latest': 'Seen'
            await this.populateEpisodeList();
            this.loaderSvc.close();
        });
    }

    async populateEpisodeList(): Promise<void> {
        try {
            this.showModel = await this.showSvc.getShowModel(this.showId);
            this.episodeDictionary = await this.episodeSvc.getEpisodeDictionary(this.showId);
        } catch (error) {
            this.toastSvc.error(`Something went wrong. Show Id ${this.showId} doesn't exist!`);
            return;
        }

        const today = new Date().getTime();
        this.seasonNumList.length = 0;
        this.commonSvc.clearObj(this.episodeList);
        this.selectedSeasonNum = 0;
        this.nextUnseenEpisodeId = '';
        this.latestEpisodeId = '';

        const episodeList: {[season: number]: {episodeId: string; seen:boolean}[]} = {};
        for (const episodeId in this.episodeDictionary ) {
            if (Object.prototype.hasOwnProperty.call(this.episodeDictionary, episodeId)) {
                const episode = this.episodeDictionary[episodeId];

                if (!episodeList[episode.season]) {
                    episodeList[episode.season] = [];
                    this.seasonUnSeen[episode.season] = 0;
                    this.seasonTotal[episode.season] = 0;
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

        this.latestEpisodeId = this.showModel.latestEpisodeId;
        this.nextUnseenEpisodeId = this.showModel.unseenEpisodeId;
        if (this.defaultMenuOption === 'Latest' && !!this.latestEpisodeId) {
            const episode = this.episodeDictionary[this.latestEpisodeId];
            this.selectedSeasonNum = episode.season;
        }
        else if (this.defaultMenuOption === 'Seen' && !!this.nextUnseenEpisodeId) {
            const episode = this.episodeDictionary[this.nextUnseenEpisodeId];
            this.selectedSeasonNum = episode.season;
        }
        if(!!this.showModel) {
            this.showModel.totalSeasons = this.seasonNumList.length;
        }
        this.seasonNumList = Object.keys(episodeList);
        if (this.selectedSeasonNum === 0) {
            this.selectedSeasonNum = this.seasonNumList[this.seasonNumList.length - 1];
        }
        this.episodeList = episodeList;
        this.showDetails = this.showModel.totalEpisodes === 0;
        this.cdRef.markForCheck();
    }

    goToUrl(): void {
        if (this.showModel) {
            window.open(this.showModel.url, '_blank');
        }
    }

    removeShow(): void {
        this.showSvc.removeShow(this.showId);
        this.router.navigate(['/']);
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
            if (this.defaultMenuOption === 'Seen') {
                episode = this.episodeDictionary[this.nextUnseenEpisodeId];
                this.selectedSeasonNum = episode.season;
            }
        }
    }
    async refresh() {
       const show = await this.showSvc.getShow(this.showId);
       await this.showSvc.addUpdateTvMazeShow(show.apiSource, show.apiId[show.apiSource] as string);
       this.cdRef.markForCheck();
    }
}
