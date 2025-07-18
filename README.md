# TvWatchlist

https://tv-watchlist.github.io

## TODO
- [ ] add push notification
- [ ] add cron/background job to update references and data.

- [ ] Add Analytics and show live data as page (highlights will be most watched show, total users, trending episode etc)
- [ ] show interactive step welcome/help
- [ ] pull page for refresh https://medium.com/angularwave/rxjs-and-angular-pull-to-refresh-that-emulates-native-ios-and-android-rxjs-challenge-18-75408c53f66
- [ ] show desktop view
- [ ] show countdown page
- [ ] show schedule page
- [ ] add Movie Watchlist
- [ ] From Search/Popular navigate to details if already exists
- [ ] Click pics to show more pics

- [ ] follow WCAG guideline 
- [ ] support i18n For languages
- [ ] dark mode or themable
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


## Initial Steps to create project

[Angular CLI](https://github.com/angular/angular-cli) version 20.1.1

Taken from https://angular.io/guide/file-structure#multiple-projects

0) Using Node v22.17.1 (includes yarn v1.22.22) and Angular v20.1.1
1) ng new tv-watchlist --create-application="false" --package-manager="yarn"
    o zoneless = Yes
2) cd tv-watchlist
3) ng generate application pwa --strict --prefix="tvq"
    o SSR/SSG = Yes
    o CSS
    o zoneless = Yes
4) ng generate application webextension --strict --prefix="tvq"
    o SSR/SSG = Yes
    o CSS
    o zoneless = Yes
5) ng generate library common --prefix="lib"
6) ng add @angular/pwa --project pwa
7) cd projects/pwa 
9) npx pwa-asset-generator public/myTvQ.png public/icons -m public/manifest.webmanifest --padding "calc(50vh - 25%) calc(50vw - 25%)" -b "#F97316" -q 100 -i public/asset-generator-changes.html --favicon

## library upgrade history

2) 2025-07-17
   Upgraded nodejs 18.12.1 -> 22.17.1
   Upgraded angular 15.0.4 -> 20.1.1 
1) 2022-12-17
    Upgraded nodejs 16.13.2 -> 18.12.1
    Upgraded angular 13.2.0 -> 15.0.4


## Development server

Run `ng serve pwa` for a dev server. Navigate to `http://localhost:4200/`. 
The app will automatically reload if you change any of the source files.

To test pwa use `yarn run dev:pwa`. Navigate to `http://localhost:4200/`. 

For Production use `yarn run build:prod`

## Analyze budget
1) ng build --stats-json
2) npx webpack-bundle-analyzer ./dist/pwa/stats.json

## angular.json
"prerender": false, // Set to false to disable prerendering
"ssr": false        // Set to false to disable SSR
OR
"outputMode": "server",
 "ssr": {
          "entry": "projects/pwa/src/server.ts"
         }
"ssr": {
              "entry": "projects/webextension/src/server.ts"
            }
