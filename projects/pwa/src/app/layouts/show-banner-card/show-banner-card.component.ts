import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShowService, GoogleAnalyticsService, UiShowModel, SvgIconComponent } from 'common';

@Component({
    selector: 'tvq-show-banner-card',
    templateUrl: 'show-banner-card.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, SvgIconComponent]
})
export class ShowBannerCardComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private gaSvc: GoogleAnalyticsService,
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
            this.gaSvc.trackSeen(show.name,show.unseenEpisode.name);
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
