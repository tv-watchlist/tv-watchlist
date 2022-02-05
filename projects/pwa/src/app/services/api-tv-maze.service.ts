import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

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

/**
 * https://www.tvmaze.com/api
 */
@Injectable({ providedIn: 'root' })
export class ApiTvMazeService {
    constructor(private http: HttpClient,) { }

    /**
     * Search through all the shows in by the show's name. A fuzzy algorithm is used (with a fuzziness value of 2)
     * https://www.tvmaze.com/api#show-search
     * @param searchTxt
     * @returns
     */
    searchShow(searchTxt: string): Observable<ITvMazeSearch[]> {
        return this.http.get<ITvMazeSearch[]>(`https://api.tvmaze.com/search/shows?q=${searchTxt}`);
    }
}

