import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { slideInLeftOnEnterAnimation, slideInRightOnEnterAnimation, slideOutLeftOnLeaveAnimation, slideOutRightOnLeaveAnimation } from 'angular-animations';
import { ShowService } from "../../services/show.service";

@Component({
    selector: 'tvq-home',
    templateUrl: 'home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        slideInLeftOnEnterAnimation({ anchor: 'enterLeft', duration: 400 }),
        slideInRightOnEnterAnimation({ anchor: 'enterRight', duration: 400 }),
        slideOutLeftOnLeaveAnimation({ anchor: 'leaveLeft', duration: 400 }),
        slideOutRightOnLeaveAnimation({ anchor: 'leaveRight', duration: 400 }),
    ]
})
export class HomeComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private cdRef: ChangeDetectorRef) {
    }

    showIdList: string[] = [];

    async ngOnInit(): Promise<void> {
        this.showIdList = (await this.showSvc.getAll()).map(o=>o.showId);
        this.cdRef.markForCheck();
    }
}
