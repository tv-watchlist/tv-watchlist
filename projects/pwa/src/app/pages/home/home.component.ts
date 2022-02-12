import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { slideInLeftOnEnterAnimation, slideInRightOnEnterAnimation, slideOutLeftOnLeaveAnimation, slideOutRightOnLeaveAnimation } from 'angular-animations';
import { SettingService } from '../../services/mytvq/setting.service';
import { ShowService } from '../../services/mytvq/show.service';
import { LoaderScreenService } from '../../widgets/loader/loader-screen.service';

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
        private settingSvc: SettingService,
        private showSvc: ShowService,
        private loaderSvc: LoaderScreenService,
        private cdRef: ChangeDetectorRef) {
    }

    showIdList: string[] = [];

    async ngOnInit(): Promise<void> {
        this.loaderSvc.show();
        const t0 = performance.now();
        await this.showSvc.smartUpdateAllShows();
        await this.showSvc.updateAllShowReference();
        this.showIdList = (await this.settingSvc.get('showIdOrderList'));
        const t1 = performance.now();
        console.log(`Call to updateAllShowReference took ${(t1 - t0)} milliseconds.`);
        this.loaderSvc.close();
        this.cdRef.markForCheck();
    }
}
