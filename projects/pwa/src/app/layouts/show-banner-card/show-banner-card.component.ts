import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShowService } from '../../services/show.service';
import { EpisodeService } from '../../services/episode.service';
import { UiShowModel } from '../../services/ui.model';

@Component({
    selector: 'tvq-show-banner-card',
    templateUrl: 'show-banner-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowBannerCardComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private episodeSvc: EpisodeService,
        private router: Router,
        private cdRef: ChangeDetectorRef,
        ) { }

    @Input() public showId!: string;

    model!: UiShowModel;

    async ngOnInit(): Promise<void> {
        if (!this.showId) {
            throw (new Error('The required input [showId] was not provided'));
        }

        this.model = await this.showSvc.getShowModel(this.showId);

        this.cdRef.markForCheck();
    }

    markAsSeen(): void {
        // const impEpisodes = this.episodeSvc.getImportantEpisodes(show);
        // if (!!impEpisodes.next) {
        //     this.showSvc.markAsSeen(show, impEpisodes.next);
        //     this.model.nextEpisodeName = this.episodeSvc.getEpisodeName(impEpisodes.next);
        // } else {
        //     this.model.nextEpisodeName = '';
        //     this.model.unseenCount = 0;
        // }
        this.cdRef.markForCheck();
    }

    goToShowDetails(): void {
        this.router.navigate(['/show-detail/', this.showId]);
        this.cdRef.detectChanges();
    }
}
