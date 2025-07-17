import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ButtonComponent, SvgIconComponent } from 'common';
import { CheckForUpdateService } from '../../service-workers/check-for-update.service';
import { TvWatchlistService } from '../../services/tv-watchlist.service';

@Component({
    selector: 'tvq-about',
    templateUrl: 'about.component.html',
    imports: [CommonModule, ButtonComponent, SvgIconComponent]
})
export class AboutComponent implements OnInit {
    constructor(
        private updateSvc: CheckForUpdateService,
        private http: HttpClient,
        private tvqSvc: TvWatchlistService,
        private cdRef: ChangeDetectorRef) { }
    version: string = 'v3.0';

    @ViewChild('btnUpdate') btnUpdate!: ButtonComponent;
    @ViewChild('btnInstall' ) btnInstall!: ButtonComponent;

    ngOnInit(): void {
        this.http.get<string>('../../assets/version.txt',{responseType: 'text' as 'json'} ).subscribe(ver => {
            this.version = ver;
        });
    }
    get Screen() {
        let screenSize = '';
        if (screen.width) {
            const width = screen.width ? screen.width : '';
            const height = screen.height ? screen.height : '';
            screenSize += `${width}x${height}`;
        }
        return screenSize;
    }

    get Platform() {
        return navigator.platform;
    }

    get appVersion() {
        return navigator.appVersion;
    }

    get appName() {
        return navigator.appName;
    }

    get userAgent() {
        return navigator.userAgent;
    }

    get IsStandalone() {
        return this.tvqSvc.IsInStandaloneMode;
    }

    get IsIos() {
        return !!this.tvqSvc.IsIos;
    }

    get showInstall() {
        return !!this.tvqSvc.deferredInstallPrompt
    }

    get Browser() {
        return this.tvqSvc.Browser;
    }

    goToUrl(url: string): void {
        window.open(url, '_blank');
    }

    async checkforUpdate() {
        this.btnUpdate.isDisabled = true;
        try {
           await this.updateSvc.checkForUpdate()
        } catch (_) {
        }
        this.btnUpdate.isDisabled = false;
    }

    async install() {
        this.btnInstall.isDisabled = true;
        await this.tvqSvc.addToHomeScreen();
        this.btnInstall.isDisabled = false;
        this.cdRef.markForCheck();
    }
}
