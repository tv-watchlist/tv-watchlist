import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IMyTvQ, IMyTvQShow, IMyTvQShowEpisode } from '../model';
import { EpisodeService, ShowService } from '../show.service';

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

    @Input() public show!: IMyTvQShow;

    ngOnInit(): void {
        if (!this.show) {
            throw (new Error('The required input [show] was not provided'));
        }
        this.cdRef.markForCheck();
    }

    getShowStatus(): -1 | 0 | 1 {
        return this.showSvc.getShowStatus(this.show);
    }

    getEpisodeNextName(episode: IMyTvQShowEpisode): string {
        return this.episodeSvc.getEpisodeName(episode);
    }

    getNextEpisodeDays(): string {
        const episode = this.show.next_episode || this.show.last_episode;
        return this.episodeSvc.getNextEpisodeDays(episode);
    }

    getShowPremiered(): string {
        return !!this.show.premiered ? this.show.premiered.substring(0, 4) : '';
    }

    goToShowDetails(show: IMyTvQShow): void {
        this.forceRecalculateStyle();
        this.cdRef.detectChanges();
        this.cdRef.detectChanges();
        this.router.navigate(['/show-detail/', show.show_id]);
    }

    private forceRecalculateStyle(): number {
        return window.scrollY; // force reflow for animation
    }
}
