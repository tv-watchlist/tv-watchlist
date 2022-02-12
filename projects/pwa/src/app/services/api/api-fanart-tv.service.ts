import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export interface IFanartTvShow {
    name: string;
    thetvdb_id: string; // number in quotes
    characterart: IFanartTvImage[];
    hdtvlogo: IFanartTvImage[];
    tvthumb: IFanartTvImage[];
    showbackground: IFanartTvImage[];
    tvposter: IFanartTvImage[];
    hdclearart: IFanartTvImage[];
    seasonposter: IFanartTvImage[];
    tvbanner: IFanartTvImage[]; // i need first
    seasonbanner: IFanartTvImage[];
    seasonthumb: IFanartTvImage[];
}
export interface IFanartTvImage {
    id: string, // number in quotes
    url: string,
    lang: string,
    likes: string // number in quotes
}

/**
 * https://www.tvmaze.com/api
 */
@Injectable({ providedIn: 'root' })
export class ApiFanartTvService {
    constructor(private http: HttpClient,) { }
    apiKey = '42bb27eae079274bec6660446cd073b5';
    /**
     *
     * @param thetvdbId
     * @returns
     */
    getShow(thetvdbId: number): Observable<IFanartTvShow> {
        return this.http.get<IFanartTvShow>(`http://webservice.fanart.tv/v3/tv/${thetvdbId}?api_key=${this.apiKey}`);
    }
}

