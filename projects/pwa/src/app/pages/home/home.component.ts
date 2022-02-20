import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { slideInLeftOnEnterAnimation, slideInRightOnEnterAnimation, slideOutLeftOnLeaveAnimation, slideOutRightOnLeaveAnimation } from 'angular-animations';
import { SettingService } from '../../services/mytvq/setting.service';
import { ShowService } from '../../services/mytvq/show.service';
import { TvWatchlistService } from '../../services/mytvq/tv-watchlist.service';
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
        private tvqSvc: TvWatchlistService,
        private cdRef: ChangeDetectorRef) {
    }

    showIdList: string[] = [];

    get isIOS() {
        return this.tvqSvc.IsIos;
    }

    get isInStandaloneMode() {
        return this.tvqSvc.IsInStandaloneMode;
    }

    async ngOnInit(): Promise<void> {
        this.loaderSvc.show();
        const t0 = performance.now();
        try {
            await this.showSvc.smartUpdateAllShows();
        } catch {
            // maybe offline
        }

        await this.showSvc.updateAllShowReference();
        this.showIdList = (await this.settingSvc.get('showIdOrderList'));
        const t1 = performance.now();
        console.log(`Call to updateAllShowReference took ${(t1 - t0)} milliseconds.`);
        this.loaderSvc.close();
        this.cdRef.markForCheck();
    }
}
