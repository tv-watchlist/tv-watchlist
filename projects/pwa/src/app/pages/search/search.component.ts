import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiTvMazeService, ITvMazeSearch } from '../../services/api-tv-maze.service';

@Component({
    selector: 'tvq-search',
    templateUrl: 'search.component.html'
})

export class SearchComponent implements OnInit {
    constructor(private svc: ApiTvMazeService,) { }
    searchTxt = '';
    searchList$?: Observable<ITvMazeSearch[]>;

    ngOnInit(): void { }

    search() {
        this.searchList$ = this.svc.searchShow(this.searchTxt)
            .pipe(
                tap(result => {
                    console.log('search', this.searchTxt, JSON.stringify(result));
                })
            );
    }

    goToUrl(url: string): void {
        window.open(url, '_blank');
    }
}
