# TvWatchlist

https://tv-watchlist.github.io

## TODO
- [x] mobile view first (use flat file as mock data)
- [x] use data from indexedDb
- [x] migration of old data from flat file
- [x] fetch data from web (tvmaze, tvdb etc)
- [x] search current page and web
- [x] show version
- [x] show welcome page
- [x] stop requests when offline
- [x] show loading gif
- [x] on first time or empty data show trending shows where can also add.
- [x] add notification
- [x] add dropbox/drive cloud save
- [ ] Add Analytics and show live data as page (highlights will be most watched show, total users, trending episode etc)
- [ ] add push notification
- [ ] show interactive step welcome/help
- [ ] pull page for refresh https://medium.com/angularwave/rxjs-and-angular-pull-to-refresh-that-emulates-native-ios-and-android-rxjs-challenge-18-75408c53f66
- [ ] show desktop view
- [ ] show countdown page
- [ ] show schedule page
- [ ] add cron/background job to update references and data.
- [ ] add Movie Watchlist
- [ ] From Search/Popular navigate to details if already exists
- [ ] Click pics to show more pics

- [ ] follow WCAG guideline 
- [ ] support i18n For languages
- [ ] dark mode or themable

## Initial Steps to create project

[Angular CLI](https://github.com/angular/angular-cli) version 15.0.4

Taken from https://angular.io/guide/file-structure#multiple-projects

0) Using Node v18.12.1 (includes yarn 1.22.17) 
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


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. 
The app will automatically reload if you change any of the source files.

To test pwa use `yarn run dev`. Navigate to `http://localhost:4200/`. 

For Production use `yarn run build:prod`

## Analyze budget
1) ng build --stats-json
2) npx webpack-bundle-analyzer ./dist/pwa/stats.json
