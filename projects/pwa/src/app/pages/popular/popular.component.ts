import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { map, Observable, switchMap, tap } from 'rxjs';
import { ApiTheMovieDbService, ITheMovieDbPopular } from '../../services/api-the-movie-db.service';
import { ApiTvMazeService } from '../../services/api-tv-maze.service';
import { ShowService } from '../../services/show.service';

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
    templateUrl: 'popular.component.html'
})
export class PopularComponent implements OnInit {
    constructor(private svc: ApiTheMovieDbService,
        private cdRef: ChangeDetectorRef,
        private showSvc: ShowService) { }

    showNames: string[] = [];
    result$?: Observable<IUITheMovieDbShow[]>;

    async ngOnInit(): Promise<void> {
       const showList = await this.showSvc.getAll();
       this.showNames = showList.map(s => s.name);
       this.result$ = this.svc.getPopularWithReference().pipe(map(([config, genre, popular]) => {
           const genreDict = genre.genres.reduce((prev:{[id: number]: string}, cur) => {
                prev[cur.id] = cur.name;
                return prev;
            }, {});
           const baseUrl = config.images.secure_base_url;

           return popular.results.map(o => {
                const newO: IUITheMovieDbShow = {...o} ;
                newO.poster_path = baseUrl + 'w220_and_h330_face' + o.poster_path;
                newO.genres = o.genre_ids.map(m=>genreDict[m]).join(', ');

                return newO
           });
        }));
        this.cdRef.detectChanges();
    }

    async addShow(tmdbId: any, name: string) {
        await this.showSvc.addUpdateTvMazeShow('tmdb', tmdbId);
        this.showNames.push(name);
        this.cdRef.detectChanges();
    }

    goToUrl(url: string): void {
        window.open(url, '_blank');
    }

    includes(name: string) {
        return this.showNames.includes(name);
    }
}
