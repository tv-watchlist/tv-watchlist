import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiTvMazeService, ITvMazeSearch } from '../../services/api-tv-maze.service';
import { ShowService } from '../../services/show.service';

@Component({
    selector: 'tvq-search',
    templateUrl: 'search.component.html'
})
export class SearchComponent implements OnInit {
    constructor(private searchSvc: ApiTvMazeService,
        private cdRef: ChangeDetectorRef,
        private showSvc: ShowService) { }

    showIds: string[] = [];
    searchTxt = '';
    searchList$?: Observable<ITvMazeSearch[]>;

    async ngOnInit(): Promise<void> {
        this.showIds = (await this.showSvc.getAll()).map(o=>o.showId);
    }

    search() {
        this.searchList$ = this.searchSvc.searchShow(this.searchTxt)
            .pipe(
                tap(result => {
                    // console.log('search', this.searchTxt, JSON.stringify(result));
                })
            );
    }

    async addShow(tvmazeId: any) {
        await this.showSvc.addUpdateTvMazeShow('tvmaze', tvmazeId);
        this.showIds.push('tvmaze'+ tvmazeId);
        this.cdRef.detectChanges();
    }

    goToUrl(url: string): void {
        window.open(url, '_blank');
    }

    includes(tvmazeId: number) {
        return this.showIds.includes('tvmaze'+tvmazeId);
    }
}
