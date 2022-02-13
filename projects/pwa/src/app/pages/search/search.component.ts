import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiTvMazeService, ITvMazeSearch } from '../../services/api/api-tv-maze.service';
import { ShowService } from '../../services/mytvq/show.service';
import { LoaderScreenService } from '../../widgets/loader/loader-screen.service';
import { ToastService } from '../../widgets/toast/toast.service';

@Component({
    selector: 'tvq-search',
    templateUrl: 'search.component.html'
})
export class SearchComponent implements OnInit {
    constructor(private searchSvc: ApiTvMazeService,
        private cdRef: ChangeDetectorRef,
        private loaderSvc: LoaderScreenService,
        private showSvc: ShowService) { }

    showIds: string[] = [];
    searchTxt = '';
    searchList$?: Observable<ITvMazeSearch[]>;

    async ngOnInit(): Promise<void> {
        this.loaderSvc.show();
        this.showIds = (await this.showSvc.getAll()).map(o=>o.showId);
        this.loaderSvc.close();
    }

    search() {
        if(!!this.searchTxt) {
            this.searchList$ = this.searchSvc.searchShow(this.searchTxt)
                .pipe(
                    tap(result => {
                        // console.log('search', this.searchTxt, JSON.stringify(result));
                    })
                );
        }
    }

    async addShow(tvmazeId: any, name: string) {
        this.showIds.push('tvmaze'+ tvmazeId);
        this.cdRef.detectChanges();
        await this.showSvc.addUpdateTvMazeShow('tvmaze', tvmazeId);
    }

    goToUrl(url: string): void {
        window.open(url, '_blank');
    }

    includes(tvmazeId: number) {
        return this.showIds.includes('tvmaze'+tvmazeId);
    }
}
