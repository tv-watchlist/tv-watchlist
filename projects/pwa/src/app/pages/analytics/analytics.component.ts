// https://ga-dev-tools.web.app/query-explorer/
// https://ga-dev-tools.web.app/query-explorer/?a=28414519&b=UA-28414519-1&c=55063102&ids=ga%3A55063102&start-date=7daysAgo&end-date=yesterday&metrics=ga%3AtotalEvents&dimensions=ga%3AeventCategory%2Cga%3AeventAction%2Cga%3AeventLabel&sort=ga%3AeventCategory%2C-ga%3AtotalEvents&d=0&include-empty-rows=1
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'common';

export interface IGaQueryResult {
    kind: string;
    id: string;
    query: {
        "start-date": string;
        "end-date": string;
        "ids": string;
        "dimensions": string;
        "metrics": string[];
        "start-index": number;
        "max-results": number;
    };
    itemsPerPage: number;
    totalResults: number;
    selfLink: string;
    profileInfo: {
        "profileId": string;
        "accountId": string;
        "webPropertyId": string;
        "internalWebPropertyId": string;
        "profileName": string;
        "tableId": string;
    };
    containsSampledData: boolean;
    columnHeaders: {
        "name": string;
        "columnType": string;
        "dataType": string;
    }[];
    totalsForAllResults: {
        "ga:totalEvents": string
    };
    rows: string[][];
}

@Component({
    selector: 'tvq-analytics',
    templateUrl: 'analytics.component.html'
})
export class AnalyticsComponent implements OnInit {
    constructor(private http: HttpClient, private commonSvc: CommonService) { }

    episodeList: { showName: string; episodeName: string; count: number; }[] = [];
    showList: { name: string; count: number; }[] = [];
    searchList: { name: string; count: string; }[] = [];

    ngOnInit() {
        this.http.get<IGaQueryResult>('').subscribe(obj => {

            const seenEpisode = obj.rows.filter(o => o[0] === 'SeenEpisode');// SeenEpisode, ShowName, EpisodeName, Count
            const seenShow = obj.rows.filter(o => o[0] === 'SeenShow'); // SeenShow, ShowName, EpisodeName, Count
            const popularShows = [];
            for (const episode of seenEpisode) {
                popularShows.push({ showName: episode[1], episodeName: episode[2], count: +episode[3] });
            }
            for (const show of seenShow) {
                popularShows.push({ showName: show[1], episodeName: show[2], count: +show[3] });
            }
            const showCount: { [name: string]: number } = {};
            const episodeCount: { [name: string]: number } = {};
            for (const show of popularShows) {
                showCount[show.showName] = show.count + (showCount[show.showName] || 0);
                const epKey = `${show.showName}|${show.episodeName}`;
                episodeCount[epKey] = show.count + (episodeCount[epKey] || 0);
            }

            let filteredShows = [];
            for (const name in showCount) {
                if (Object.prototype.hasOwnProperty.call(showCount, name)) {
                    const count = showCount[name];
                    if (count > 1) {
                        filteredShows.push({ name: name, count: count });
                    }
                }
            }
            this.commonSvc.sort(filteredShows, '-count');
            let filteredEpisodes = [];
            for (const name in episodeCount) {
                if (Object.prototype.hasOwnProperty.call(episodeCount, name)) {
                    const count = episodeCount[name];
                    if (count > 1) {
                        const [showName, episodeName] = name.split('|');
                        filteredEpisodes.push({ showName: showName, episodeName: episodeName, count: count });
                    }
                }
            }
            this.commonSvc.sort(filteredEpisodes, '-count');

            const showsSearch = obj.rows.filter(o => o[0] === 'Shows' && o[1] === 'Search'); //Shows, Search, ShowName, Count
            const searchList = [];
            for (const search of showsSearch) {
                searchList.push({ name: search[2], count: search[3] });
            }
            this.commonSvc.sort(searchList, '-count');

            this.searchList = searchList;
            this.showList = filteredShows;
            this.episodeList = filteredEpisodes;
        });
    }
}
