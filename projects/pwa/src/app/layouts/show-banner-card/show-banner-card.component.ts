import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IMyTvQ, IMyTvQShow, IMyTvQShowEpisode, UiShowModel } from '../../services/model';
import { EpisodeService, ShowService } from '../../services/show.service';

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
            throw (new Error('The required input [showId] was not provided'));
        }
        const show = this.showSvc.getShow(this.showId);
        const today = new Date().getTime();
        if (!!show) {
            const latestEpisode = show.next_episode || show.last_episode;
            const episode = this.showSvc.getEpisode(latestEpisode.episode_id);
            const status = this.showSvc.getShowStatus(show);
            const impEpisodes = this.showSvc.getImportantEpisodes(this.showId);
            this.model = {
                id: show.show_id,
                name: show.name,
                premiered: !!show.premiered ? show.premiered.substring(0, 4) : '',
                banner: show.image?.banner[0] || '',
                channel: show.channel.name || '',
                status,
                latestEpisodeName: this.episodeSvc.getEpisodeName(episode) || 'TBA',
                latestEpisodeDateFormatted: this.getFormattedTime(status, episode?.local_showtime),
                latestEpisodeIn: this.episodeSvc.getNextEpisodeDays(episode),
                nextEpisodeName: this.episodeSvc.getEpisodeName(impEpisodes.next),
                unseenEpisodes: show.unseen_count,
                totalEpisodes: show.total_episodes,
                expand: false,
            };
        }

        this.cdRef.markForCheck();
    }

    markAsSeen(): void {
        const impEpisodes = this.showSvc.getImportantEpisodes(this.showId);
        if (!!impEpisodes.next) {
            impEpisodes.next.seen = true;
            impEpisodes.next = this.showSvc.getEpisode(impEpisodes.next.next_id);
            const show = this.showSvc.getShow(this.showId);
            if (!!show && show.unseen_count > 0) {
                show.unseen_count = show.unseen_count - 1;
                this.model.unseenEpisodes = show.unseen_count;
            }
        }
        if (!!impEpisodes.next) {
            this.model.nextEpisodeName = this.episodeSvc.getEpisodeName(impEpisodes.next);
        } else {
            this.model.nextEpisodeName = '';
            this.model.unseenEpisodes = 0;
        }
    }

    getFormattedTime(status: number, localShowtime?: number): string {
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
