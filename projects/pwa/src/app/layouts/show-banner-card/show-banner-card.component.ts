import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EpisodeService } from '../../services/mytvq/episode.service';
import { ShowService } from '../../services/mytvq/show.service';
import { UiShowModel } from '../../services/mytvq/ui.model';

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

    async markAsSeen(): Promise<void> {
        const show = await this.showSvc.getShow(this.showId);

        if (!!show.unseenEpisode) {
            await this.showSvc.markAsSeen(show, show.unseenEpisode.episodeId);
            this.model = await this.showSvc.getShowModel(this.showId);
            this.model.expand = true;
        }
        this.cdRef.markForCheck();
    }

    goToShowDetails(): void {
        this.router.navigate(['/show-detail/', this.showId]);
        this.cdRef.detectChanges();
    }
}
