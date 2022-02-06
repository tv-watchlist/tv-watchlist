import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap, forkJoin } from 'rxjs';

// import { IMyTvQFlatV5 } from './flat-file-v5.model';
import { WebDatabaseService } from './web-database.service';
import { ShowService } from './show.service';
import { SettingService } from './setting.service';

@Injectable({ providedIn: 'root' })
export class TvWatchlistService {
    constructor(
        private settingSvc: SettingService,
        private showSvc: ShowService,
        private http: HttpClient,
        private webDb: WebDatabaseService,
    ) {
        this.now = new Date().getTime();
    }

    now: number;

    initAll(): Observable<boolean> {
        return forkJoin([
            this.settingSvc.initSettings()
        ])
        .pipe(
            tap(([_]) => {
                // console.log('getMyTvQJson test data', myTvQJson);
                // this.showSvc.initShowList(this.settingSvc.showsOrder, (myTvQJson as IMyTvQFlatV5).show_list);
            }),
            map(() => true)
        );
    }
}
