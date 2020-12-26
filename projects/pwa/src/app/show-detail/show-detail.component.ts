import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IMyTvQShow } from '../model';
import { ShowService } from '../show.service';
import { NavigationService } from '../navigation.service';

@Component({
    selector: 'tvq-show-detail',
    templateUrl: 'show-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowDetailComponent implements OnInit {
    constructor(
        private navSvc: NavigationService,
        private cdRef: ChangeDetectorRef,
        ) { }

    ngOnInit(): void {
    }

    back(): void {
        this.navSvc.back();
    }
}
