import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input, Inject, EventEmitter, Output } from '@angular/core';
import { EpisodeService } from '../../services/episode.service';
import { IMyTvQShowFlatV5 } from '../../services/flat-file-v5.model';
import { UiEpisodeModel } from '../../services/ui.model';
import { ShowService } from '../../services/show.service';
import { IMyTvQDbShow } from '../../services/db.model';

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

    @Input() public seenToggled!: boolean;
    @Output() public seenToggledChanged = new EventEmitter<boolean>();

    model!: UiEpisodeModel;
    private show!: IMyTvQDbShow;
    async ngOnInit(): Promise<void> {
        if (!this.episodeId) {
            throw (new Error('The required input [episodeId] was not provided'));
        }
        this.show = await this.showSvc.getShowByEpisodeId(this.episodeId);
        this.model = await this.episodeSvc.getEpisodeModel(this.episodeId, this.show.channel.country.code);
        // this.seenToggled = this.model.seen;
        this.cdRef.markForCheck();
    }

    expand(): void {
        this.model.expand = !this.model.expand;
    }

    async toggleSeen() {
        this.model.seen = !this.model.seen

        if(!this.model.seen) {
            this.show.unseenCount--;
        } else {
            this.show.unseenCount++;
        }
        await this.episodeSvc.toggleSeen(this.episodeId, this.model.seen);
        this.show.lastWatchedTime = new Date().getTime();
        await this.showSvc.save(this.show);
        this.seenToggled = this.model.seen;
        this.seenToggledChanged.emit(this.seenToggled);
    }

    goToUrl(url: string): void {
        // this.document.location.href = this.model.url;
        window.open(url, '_blank');
    }
}
