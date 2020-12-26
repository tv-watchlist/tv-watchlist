import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';

// https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page
@Injectable({ providedIn: 'root' })
export class NavigationService {
    private history: string[] = [];

    constructor(private router: Router, private location: Location) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.history.push(event.urlAfterRedirects);
                console.log('push history');
            }
        });
    }

    back(): void {
        const url = this.history.pop();
        console.log('pop history', url, this.history.length);

        if (!!url) {
            this.location.back();
        } else {
           // this.router.navigateByUrl('/');
        }
    }
}
