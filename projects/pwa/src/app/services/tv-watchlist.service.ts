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
    ) {
        this.now = new Date().getTime();
    }

    now: number;
}
