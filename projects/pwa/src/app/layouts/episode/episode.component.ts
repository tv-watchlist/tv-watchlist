import { DatePipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UiEpisodeModel } from '../../services/model';
import { ShowService, EpisodeService, SettingService } from '../../services/show.service';


@Component({
    selector: 'tvq-episode',
    templateUrl: 'episode.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EpisodeComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private episodeSvc: EpisodeService,
        private settingSvc: SettingService,
        private router: Router,
        private cdRef: ChangeDetectorRef,
        private datePipe: DatePipe,
        ) {
            this.today = new Date().getTime();
    }

    private today: number;
    @Input() public episodeId!: string;
    @Input() public highLightNextEpisodeId = '';
    model!: UiEpisodeModel;
    ngOnInit(): void {
        if (!this.episodeId) {
            throw (new Error('The required input [episodeId] was not provided'));
        }
        const show =  this.showSvc.getShowByEpisodeId(this.episodeId);
        const episode = this.showSvc.getEpisode(this.episodeId);
        if (!episode) {
            throw (new Error('Episode was not found'));
        }

        this.model = {
            id: episode.episode_id,
            episodeName: this.episodeSvc.getEpisodeName(episode),
            dateFormatted: '',
            summary: episode.summary,
            isUnaired: episode.local_showtime > this.today,
            image: Array.isArray(episode.image?.poster) ? episode.image?.poster[0] : episode.image?.poster ,
            seen: episode.seen,
            expand: false,
        };

        if (episode.local_showtime) {
            const offsetNextDate = new Date(episode.local_showtime);
            const offset = this.settingSvc.getTimezoneOffset(show?.channel?.country.name);
            if (!!offset) {
                offsetNextDate.setMinutes(offsetNextDate.getMinutes() + (60 * offset));
            }
            // Sat 1:25 PM, Jul 23rd, 2016
            if (this.model.isUnaired) {
                this.model.dateFormatted = this.datePipe.transform(offsetNextDate, 'EEE hh:mm a, MMM dd, y') || 'n/a';
            } else {
                this.model.dateFormatted = this.datePipe.transform(offsetNextDate, 'MMM dd, y') || 'n/a';
            }
        } else {
            this.model.dateFormatted = 'n/a';
        }


        this.cdRef.markForCheck();
    }
}
