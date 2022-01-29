import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Component({
    selector: 'tvq-search',
    templateUrl: 'search.component.html'
})

export class SearchComponent implements OnInit {
    constructor(private http: HttpClient,) { }
    searchTxt = '';
    searchList$?: Observable<ITvMazeSearch[]>;

    ngOnInit(): void { }

    search() {
        this.searchList$ = this.http.get<ITvMazeSearch[]>(`https://api.tvmaze.com/search/shows?q=${this.searchTxt}`)
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

export interface ITvMazeSearch {
    score: number;
    show: {
        id: number;
        url: string;
        name: string;
        type: string,
        language: string,
        genres: string[],
        status: string,
        runtime: number,
        averageRuntime: number,
        premiered: string,
        ended: string,
        officialSite: string,
        schedule: { time: string, days: string[] },
        rating: { average: number },
        weight: number,
        network: { id: number, name: string, country: { name: string, code: string, timezone: string } },
        webChannel: { id: number, name: string, country: { name: string, code: string, timezone: string } },
        dvdCountry: string,
        externals: { tvrage: string, thetvdb: number, imdb: string },
        image: { medium: string, original: number },
        summary: string,
        updated: number,
        _links: {
            self: { href: string },
            previousepisode: { href: string },
            nextepisode: { href: string },
        },
    }
}
