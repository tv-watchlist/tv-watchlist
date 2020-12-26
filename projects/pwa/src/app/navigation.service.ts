import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd, Scroll } from '@angular/router';
import { Observable, Subject } from 'rxjs';

interface IHistoryType {
    url: string;
    position: [number, number] | null;
    anchor: string | null;
}

// https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page
@Injectable({ providedIn: 'root' })
export class NavigationService {
    constructor(private router: Router, private location: Location) {
        this.router.events.subscribe((event) => {
            if (event instanceof Scroll) {
                const history = {url: event.routerEvent.urlAfterRedirects, position: event.position, anchor: event.anchor};
                this.historyMap.set(event.routerEvent.urlAfterRedirects, history);
                this.backSubject.next(history);
            }
            // if (event instanceof NavigationEnd) {
            //     console.log('push history', event.urlAfterRedirects);
            // }
        });
    }

    private historyMap: Map<string, IHistoryType> = new Map();
    private backSubject = new Subject<IHistoryType>();

    get onBack(): Observable<IHistoryType> {
        return this.backSubject.asObservable();
    }

    back(): void {
        this.location.back();
        // const history = this.historyList.pop();
        // if (!!history) {
        //     this.location.back();
        // } else {
        //     this.router.navigateByUrl('/');
        // }
    }
}
