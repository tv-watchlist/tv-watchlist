import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IMyTvQShow } from '../../services/model';
import { ShowService } from '../../services/show.service';

@Component({
    selector: 'tvq-home',
    templateUrl: 'home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private cdRef: ChangeDetectorRef) {
        }

    showIdList: string[] = [];

    ngOnInit(): void {
        this.showIdList = this.showSvc.uiShowIdOrder.filter(o => !!this.showSvc.shows.has(o));
        this.cdRef.markForCheck();
    }
}
