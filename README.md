# TvWatchlist

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.5.

## Steps

Taken from https://angular.io/guide/file-structure#multiple-projects

0) Using Node 14.15.3 (includes npm 6.14.9) 
1) ng new tv-watchlist --createApplication="false"

    o strict = Yes
2) cd tv-watchlist
3) ng generate application pwa
   
    o route - Yes, CSS 
4) ng generate application webextension
5) ng generate library common
6) ng add @angular/pwa --project pwa
7) cd projects/pwa 
8) npx pwa-asset-generator src/assets/myTvQ.png src/assets/icons -m src/manifest.webmanifest --padding "calc(50vh - 25%) calc(50vw - 25%)" -b "#F97316" -q 100 -i src/asset-generator-changes.html --favicon

## TODO
* mobile view first (use flat file as mock data)
* use data from indexedDb
* migration of old data from flat file
* fetch data from web (tvmaze, tvdb etc)
* search current page and web
* show version
* show interactive step welcome/help
* pull page for refresh https://medium.com/angularwave/rxjs-and-angular-pull-to-refresh-that-emulates-native-ios-and-android-rxjs-challenge-18-75408c53f66
* show loading gif
* show desktop view
* show countdown page
* show schedule page
* on first time or empty data show trending shows where can also add.
* add notification
* add dropbox/drive cloud save
* add cron/background job to update references and data.
* Add Analytics and show live data as page (highlights will be most watched show, total users, trending episode etc)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

To test pwa use `npm run build:prod` then `npm run run:pwa`

## Analyze budget
1) ng build --stats-json
2) npx webpack-bundle-analyzer ./dist/pwa/stats.json
