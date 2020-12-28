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

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

To test pwa use `npm run build:prod` then `npm run run:pwa`

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
