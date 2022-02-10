import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

export interface ITvMazeSearch {
    score: number;
    show: ITvMazeShow
}

export interface ITvMazeShow {
    id: number;
    url: string;
    name: string;
    type: string;
    language: string;
    genres: string[];
    status: string;
    runtime: number;
    averageRuntime: number;
    premiered: string;
    ended: string;
    officialSite: string;
    schedule: { time: string; days: string[] };
    rating: { average: number };
    weight: number;
    network: { id: number; name: string; country: { name: string; code: string; timezone: string } } | null;
    webChannel: { id: number; name: string; country?: { name: string; code: string; timezone: string }; officialSite: string } | null; // US America/New_York
   // id: 3, name: "Amazon Prime Video", country: null, officialSite: "https://www.primevideo.com/"
    dvdCountry: string;
    externals: { tvrage: string; thetvdb: number; imdb: string };
    image: { medium: string; original: string };
    summary: string;
    updated: number; // timestamp * 1000 = js date
    _links: {
        self: { href: string };
        previousepisode: { href: string };
        nextepisode: { href: string };
    };
    _embedded?: {
        episodes?: ITvMazeEpisode[],
        images?: ITvMazeImage[]
    }
}

export interface ITvMazeImage {
    id: number;
    type: "banner"| "poster"| "background"| "typography"| null;
    main: boolean;
    resolutions: {
        original: {
            url: string;
            width: number;
            height: number;
        };
        medium: {
            url: string;
            width: number;
            height: number;
        }
    }
}

export interface ITvMazeEpisode {
    id: number
    url: string;
    name: string;
    season: number;
    number: number;
    type: string; // regular
    airdate: string; // "2019-11-12"
    airtime: string; // "22:00"
    airstamp: string; // "2019-11-12T12:00:00+00:00"
    runtime: number; // 60
    rating: { average: number };
    image: {
        medium: string;
        original: string;
    };
    summary: string;
    _links: {
        self: {
            href: string
        };
    };
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

    getShowAndEpisode(tvmazeId: string) {
        return forkJoin([
            this.http.get<ITvMazeShow>(`http://api.tvmaze.com/shows/${tvmazeId}?embed=images`),
            this.http.get<ITvMazeEpisode[]>(`http://api.tvmaze.com/shows/${tvmazeId}/episodes?specials=1`)
        ]).pipe(delay(1000)); // delay to avoid 429:Too Many Requests
    }

    getByThetvdb(thetvdbId:number) {
        return this.http.get<ITvMazeShow>(`http://api.tvmaze.com/lookup/shows?thetvdb=${thetvdbId}`).pipe(
            switchMap(show => {
                return forkJoin([
                    of(show),
                    this.http.get<ITvMazeImage[]>(`https://api.tvmaze.com/shows/${show.id}/images`),
                    this.http.get<ITvMazeEpisode[]>(`http://api.tvmaze.com/shows/${show.id}/episodes?specials=1`)
                ])
            })
        )
    }

    // nsr.myTvQ.tvmaze.api.LookupByThetvdb = function(thetvdb_id, callback){
    //     $.getJSON( "http://api.tvmaze.com/lookup/shows?thetvdb="+thetvdb_id, function(data) {
    //         if (callback) {
    //             callback(data);
    //         }
    //     }).fail(function(jqXHR, textStatus) {
    //         console.log( "tvmaze.LookupByThetvdb",jqXHR );
    //         if (callback) {
    //             callback(false);
    //         }
    //     });
    // }

    /**
     *
     * @param since
     * @returns {showId: timestamp}. need to multiply timestamp with 1000 for js date
     */
    getUpdates(since:'all'|'day'|'week'|'month'='all') {
        let url = 'http://api.tvmaze.com/updates/shows';
        if( since !== 'all'){
            url += `?since=${since}`;
        }
        return this.http.get<{[tvmazeId: number]:number}>(url);
    }

    getImages(tvmazeId: string) {
        return this.http.get<ITvMazeImage[]>(`https://api.tvmaze.com/shows/${tvmazeId}/images`);
    }
}
