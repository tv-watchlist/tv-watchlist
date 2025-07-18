import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input, Inject, EventEmitter, Output } from '@angular/core';
import { ShowService, EpisodeService, GoogleAnalyticsService, UiEpisodeModel, IMyTvQDbShow,SvgIconComponent, WINDOW } from 'common';

@Component({
    selector: 'tvq-episode',
    templateUrl: 'episode.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, SvgIconComponent]
})
export class EpisodeComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private episodeSvc: EpisodeService,
        private gaSvc: GoogleAnalyticsService,
        private cdRef: ChangeDetectorRef,
        @Inject(WINDOW) private window: Window,
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
        this.model = await this.episodeSvc.getEpisodeModel(this.episodeId, this.show.channel.country?.code);
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
            this.gaSvc.trackSeen(this.show.name, this.model.episodeName);
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
        this.window.open(url, '_blank');
    }
}
