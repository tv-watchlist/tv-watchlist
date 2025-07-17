import { Component, OnInit } from '@angular/core';
import { TvWatchlistService } from '../../services/tv-watchlist.service';
import { SvgIconComponent } from "common";

@Component({
    selector: 'tvq-privacy-policy',
    templateUrl: 'privacy-policy.component.html',
    imports: [SvgIconComponent]
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
