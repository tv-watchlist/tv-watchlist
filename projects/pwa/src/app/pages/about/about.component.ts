import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { CheckForUpdateService } from '../../service-workers/check-for-update.service';

@Component({
    selector: 'tvq-about',
    templateUrl: 'about.component.html'
})
export class AboutComponent implements OnInit {
    constructor(private updateSvc: CheckForUpdateService, private http: HttpClient) { }
    version: string = 'v3.0';
    ngOnInit(): void {
        this.http.get<string>('../../assets/version.txt',{responseType: 'text' as 'json'} ).subscribe(ver => {
            this.version = ver;
        });
    }

    goToUrl(url: string): void {
        window.open(url, '_blank');
    }

    checkforUpdate() {
        console.log('Checking for updates');
        this.updateSvc.checkForUpdate();
    }
}
