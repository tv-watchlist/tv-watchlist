import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiTvMazeService, LoaderScreenService, GoogleAnalyticsService, ShowService, ITvMazeSearch,SvgIconComponent } from 'common';
import { Observable, tap } from 'rxjs';

@Component({
    selector: 'tvq-search',
    standalone: true,
    templateUrl: 'search.component.html',
    imports: [CommonModule, FormsModule, SvgIconComponent]
})
export class SearchComponent implements OnInit {
    constructor(private searchSvc: ApiTvMazeService,
        private cdRef: ChangeDetectorRef,
        private loaderSvc: LoaderScreenService,
        private gaSvc: GoogleAnalyticsService,
        private showSvc: ShowService) { }

    showIds: string[] = [];
    searchTxt = '';
    searchList$?: Observable<ITvMazeSearch[]>;

    async ngOnInit(): Promise<void> {
        this.loaderSvc.show();
        this.showIds = (await this.showSvc.getAll()).map(o => o.showId);
        this.loaderSvc.close();
    }

    search() {
        if (!!this.searchTxt) {
            this.searchList$ = this.searchSvc.searchShow(this.searchTxt)
                .pipe(
                    tap(result => {
                        // console.log('search', this.searchTxt, JSON.stringify(result));
                    })
                );
            this.gaSvc.trackSearch(this.searchTxt);
        }
    }

    async addShow(tvmazeId: any, name: string) {
        this.showIds.push('tvmaze' + tvmazeId);
        this.cdRef.detectChanges();
        await this.showSvc.addUpdateTvMazeShow('tvmaze', tvmazeId);
        this.gaSvc.trackShowAdd(name, 'search');
    }

    goToUrl(url: string): void {
        window.open(url, '_blank');
    }

    includes(tvmazeId: number) {
        return this.showIds.includes('tvmaze' + tvmazeId);
    }
}
