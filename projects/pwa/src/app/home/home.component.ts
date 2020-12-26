import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { IMyTvQShow } from '../model';
import { ShowService } from '../show.service';
import myTvQJson from '../../assets/tv-watchlist-2020-12-23.json';

@Component({
    selector: 'tvq-home',
    templateUrl: 'home.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private cdRef: ChangeDetectorRef) {

        }

    showList: IMyTvQShow[] = [];

    ngOnInit(): void {
        this.showList = myTvQJson.show_list;
        this.cdRef.markForCheck();
        console.log('json', myTvQJson);
    }

}
