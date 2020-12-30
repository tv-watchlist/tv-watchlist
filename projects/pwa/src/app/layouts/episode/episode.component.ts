import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UiEpisodeModel } from '../../services/model';
import { ShowService, EpisodeService } from '../../services/show.service';


@Component({
    selector: 'tvq-episode',
    templateUrl: 'episode.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EpisodeComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private episodeSvc: EpisodeService,
        private router: Router,
        private cdRef: ChangeDetectorRef,
        ) { }

    @Input() public episode!: UiEpisodeModel;
    @Input() public highLightNextEpisodeId = '';

    ngOnInit(): void {
        if (!this.episode) {
            throw (new Error('The required input [episode] was not provided'));
        }
        this.cdRef.markForCheck();
    }
}
