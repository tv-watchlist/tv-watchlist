import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IMyTvQ, IMyTvQShow, IMyTvQShowEpisode } from '../../services/model';
import { EpisodeService, ShowService } from '../../services/show.service';

export interface UiShowModel {
    id: string;
    name: string;
    premiered: string;
    channel: string;
    status: number;
    banner: string;
    currentEpisodeName: string;
    currentEpisodeDateFormatted: string;
    currentEpisodeIn: string;
    nextEpisodeName: string;
    unseenEpisodes: number;
    totalEpisodes: number;
    expand: boolean;
}

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
        private datePipe: DatePipe,
        private cdRef: ChangeDetectorRef,
        ) { }

    @Input() public showId!: string;

    model!: UiShowModel;

    ngOnInit(): void {
        if (!this.showId) {
            throw (new Error('The required input [show] was not provided'));
        }
        const show = this.showSvc.shows.get(this.showId);
        if (!!show) {
            const currentEpisode = show.next_episode || show.last_episode;
            const status = this.showSvc.getShowStatus(show);
            this.model = {
                id: show.show_id,
                name: show.name,
                premiered: !!show.premiered ? show.premiered.substring(0, 4) : '',
                banner: show.image?.banner[0] || '',
                channel: show.channel.name || '',
                status,
                currentEpisodeName: this.episodeSvc.getEpisodeName(currentEpisode),
                currentEpisodeDateFormatted: this.getFormattedTime(currentEpisode.local_showtime, status),
                currentEpisodeIn: this.episodeSvc.getNextEpisodeDays(currentEpisode),
                nextEpisodeName: 'Episode Placeholder',
                unseenEpisodes: show.unseen_count,
                totalEpisodes: show.total_episodes,
                expand: false,
            };
        }

        this.cdRef.markForCheck();
    }

    getFormattedTime(localShowtime: number, status: number): string {
        switch (status) {
            case 0:
                return this.datePipe.transform(localShowtime, 'EEE h:mm a, MMM d, y') || 'n/a';
                case -1:
                case 1:
            default:
                return this.datePipe.transform(localShowtime, 'MMM d, y') || 'n/a';
        }
    }

    goToShowDetails(): void {
        this.router.navigate(['/show-detail/', this.showId]);
        this.cdRef.detectChanges();
    }
}
