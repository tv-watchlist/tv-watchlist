import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { CheckForUpdateService } from '../../service-workers/check-for-update.service';
import { TvWatchlistService } from '../../services/mytvq/tv-watchlist.service';

@Component({
    selector: 'tvq-about',
    templateUrl: 'about.component.html'
})
export class AboutComponent implements OnInit {
    constructor(private updateSvc: CheckForUpdateService, private http: HttpClient,private tvqSvc: TvWatchlistService) { }
    version: string = 'v3.0';
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

    checkforUpdate() {
        this.updateSvc.checkForUpdate();
    }

    install() {
        this.tvqSvc.addToHomeScreen();
    }
}
