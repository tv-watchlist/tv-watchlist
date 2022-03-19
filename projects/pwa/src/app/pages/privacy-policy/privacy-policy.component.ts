import { Component, OnInit } from '@angular/core';
import { TvWatchlistService } from '../../services/tv-watchlist.service';

@Component({
    selector: 'tvq-privacy-policy',
    templateUrl: 'privacy-policy.component.html'
})
export class PrivacyPolicyComponent implements OnInit {
    constructor(private tvqSvc: TvWatchlistService) { }

    get IsStandalone() {
        return this.tvqSvc.IsInStandaloneMode;
    }

    ngOnInit() { }

    goHome(){
        document.location.href = '/';
    }
}
