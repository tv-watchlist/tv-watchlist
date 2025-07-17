import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { slideInLeftOnEnterAnimation, slideInRightOnEnterAnimation, slideOutLeftOnLeaveAnimation, slideOutRightOnLeaveAnimation } from 'angular-animations';
import { SettingService, ShowService, LoaderScreenService, ShowNotificationService,SvgIconComponent,ButtonComponent } from 'common';
import { TvWatchlistService } from '../../services/tv-watchlist.service';
import { ShowBannerCardComponent } from "../../layouts/show-banner-card/show-banner-card.component";
import { RouterModule } from '@angular/router';


@Component({
    selector: 'tvq-home',
    templateUrl: 'home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        slideInLeftOnEnterAnimation({ anchor: 'enterLeft', duration: 400 }),
        slideInRightOnEnterAnimation({ anchor: 'enterRight', duration: 400 }),
        slideOutLeftOnLeaveAnimation({ anchor: 'leaveLeft', duration: 400 }),
        slideOutRightOnLeaveAnimation({ anchor: 'leaveRight', duration: 400 }),
    ],
    imports: [RouterModule, ShowBannerCardComponent, SvgIconComponent, ButtonComponent]
})
export class HomeComponent implements OnInit {
    constructor(
        private settingSvc: SettingService,
        private showSvc: ShowService,
        private notifySvc: ShowNotificationService,
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

    get showInstall() {
        return !!this.tvqSvc.deferredInstallPrompt
    }

    async ngOnInit(): Promise<void> {
        this.loaderSvc.show();
        const t0 = performance.now();
        try {
            await this.showSvc.smartUpdateAllShows();
        } catch {
            // maybe offline
        }

        await this.showSvc.updateAndSaveAllShowReference();
        this.showIdList = (await this.settingSvc.get('showIdOrderList'));
        const t1 = performance.now();
        console.log(`Call to updateAllShowReference took ${(t1 - t0)} milliseconds.`);
        this.loaderSvc.close();
        this.notifySvc.displayShowNotifications();
        this.cdRef.markForCheck();
    }

    install() {
        console.log('installing');
        this.tvqSvc.addToHomeScreen();
    }
}
