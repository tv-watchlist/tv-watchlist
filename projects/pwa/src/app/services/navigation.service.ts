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
                this.historyList.push(history);
                this.backSubject.next(history);
            }
        });
    }

    private historyList: Array<IHistoryType> = [];
    private backSubject = new Subject<IHistoryType>();

    get onBack(): Observable<IHistoryType> {
        return this.backSubject.asObservable();
    }

    back(): void {
        const history = this.historyList.pop();
        if (!!history) {
            this.location.back();
        } else {
            this.router.navigateByUrl('/');
        }
    }
}
