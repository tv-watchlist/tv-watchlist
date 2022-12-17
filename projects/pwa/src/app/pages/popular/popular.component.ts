import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiTheMovieDbService, LoaderScreenService, GoogleAnalyticsService, ShowService, SvgIconComponent } from 'common';
import { lastValueFrom, map } from 'rxjs';

export interface IUITheMovieDbShow {
    first_air_date: string; //  "2022-01-28"
    genres?: string;
    genre_ids?: number[]; // [18, 10765];
    id: number; //  99966;
    name: string; //  "All of Us Are Dead"
    origin_country: string[]; //['KR']
    original_language: string; //  "ko"
    original_name: string; //  "지금 우리 학교는"
    overview: string; //  "A high school becomes ground zero for a zombie virus outbreak. Trapped students must fight their way out — or turn into one of the rabid infected."
    popularity: number; //  6313.212
    poster_path: string; //  "/pTEFqAjLd5YTsMD6NSUxV6Dq7A6.jpg"
    vote_average: number; //  8.8
    vote_count: number; //  1017
}

@Component({
    selector: 'tvq-popular',
    standalone: true,
    templateUrl: 'popular.component.html',
    imports: [CommonModule, SvgIconComponent]
})
export class PopularComponent implements OnInit {
    constructor(private svc: ApiTheMovieDbService,
        private cdRef: ChangeDetectorRef,
        private loaderSvc: LoaderScreenService,
        private gaSvc: GoogleAnalyticsService,
        private showSvc: ShowService) { }

    showNames: string[] = [];
    result?: IUITheMovieDbShow[];

    async ngOnInit(): Promise<void> {
        this.loaderSvc.show();
        const showList = await this.showSvc.getAll();
        this.showNames = showList.map(s => s.name);
        const result$ = this.svc.getPopularWithReference().pipe(map(([config, genre, popular]) => {
            const genreDict = genre.genres.reduce((prev: { [id: number]: string }, cur) => {
                prev[cur.id] = cur.name;
                return prev;
            }, {});
            const baseUrl = config.images.secure_base_url;

            return popular.results.map(o => {
                const newO: IUITheMovieDbShow = { ...o };
                if(!!o.poster_path) {
                    newO.poster_path = baseUrl + 'w220_and_h330_face' + o.poster_path;
                } else {
                    newO.poster_path = 'assets/icons/apple-icon-180.png';
                }

                newO.genres = o.genre_ids.map(m => genreDict[m]).join(', ');

                return newO
            });
        }));

        try {
            this.result = await lastValueFrom(result$);
        } catch {
            // maybe offline
        }
        // console.log('Popular',this.result);
        this.loaderSvc.close();
        this.cdRef.detectChanges();
    }

    async addShow(tmdbId: any, name: string) {
        this.showNames.push(name);
        this.cdRef.detectChanges();
        await this.showSvc.addUpdateTvMazeShow('tmdb', tmdbId);
        this.gaSvc.trackShowAdd(name, 'popular');
    }

    goToUrl(url: string): void {
        window.open(url, '_blank');
    }

    includes(name: string) {
        return this.showNames.includes(name);
    }
}
