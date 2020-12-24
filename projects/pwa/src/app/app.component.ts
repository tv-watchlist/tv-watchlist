import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IMyTvQ, IMyTvQShow, IMyTvQShowEpisode } from './model';
import { ShowService } from './show.service';
@Component({
    selector: 'tvq-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
    constructor(
        private showSvc: ShowService,
        private cdRef: ChangeDetectorRef) {
    }

    showList: IMyTvQShow[] = [];

    ngOnInit(): void {
        this.showSvc.getMyTvQJson().subscribe(json => {
            this.showList = json.show_list;
            this.cdRef.markForCheck();
            console.log('json', json);
        });
    }
}
