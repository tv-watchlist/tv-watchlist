import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input, Inject, EventEmitter, Output } from '@angular/core';
import { EpisodeService } from "../../services/episode.service";
import { IMyTvQShowFlatV5 } from '../../services/flat-file-v5.model';
import { UiEpisodeModel } from '../../services/ui.model';
import { ShowService } from '../../services/show.service';

@Component({
    selector: 'tvq-episode',
    templateUrl: 'episode.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EpisodeComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private episodeSvc: EpisodeService,
        private cdRef: ChangeDetectorRef,
        ) {
            this.today = new Date().getTime();
    }

    private today: number;
    @Input() public episodeId!: string;
    @Input() public latestEpisodeId = '';
    @Output() public seenToggled = new EventEmitter<boolean>();

    model!: UiEpisodeModel;
    show!: IMyTvQShowFlatV5;
    ngOnInit(): void {
        if (!this.episodeId) {
            throw (new Error('The required input [episodeId] was not provided'));
        }
        this.show = this.showSvc.getShowByEpisodeId(this.episodeId);
        this.model = this.episodeSvc.getEpisodeModel(this.show, this.episodeId);

        this.cdRef.markForCheck();
    }

    expand(): void {
        this.model.expand = !this.model.expand;
    }

    toggleSeen(): void {
        this.episodeSvc.toggleSeen(this.show, this.episodeId, !this.model.seen);
        this.seenToggled.emit(!this.model.seen);
    }

    goToUrl(url: string): void {
        // this.document.location.href = this.model.url;
        window.open(url, '_blank');
    }
}
