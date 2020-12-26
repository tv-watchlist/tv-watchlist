import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { pairwise } from 'rxjs/operators';
import { slider } from './animations';

@Component({
    selector: 'tvq-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        slider
        // animation triggers go here
    ]
})
export class AppComponent implements OnInit, OnDestroy {
    constructor(
        private router: Router,
        private appElement: ElementRef,
        private cdRef: ChangeDetectorRef) {
    }

    private routeScrollPositions: { [url: string]: number } = {};
    private subscriptions: Subscription[] = [];

    ngOnInit(): void {
        // this.subscriptions.push(
        //     // save or restore scroll position on route change
        //     this.router.events.pipe(pairwise()).subscribe(([prevRouteEvent, currRouteEvent]) => {
        //         if (prevRouteEvent instanceof NavigationEnd && currRouteEvent instanceof NavigationStart) {
        //             console.log('prevRouteEvent', prevRouteEvent.url, window.pageYOffset);
        //             this.routeScrollPositions[prevRouteEvent.url] = window.pageYOffset;
        //         }
        //         if (currRouteEvent instanceof NavigationEnd) {
        //             console.log('currRouteEvent', currRouteEvent.url, this.routeScrollPositions[currRouteEvent.url] );
        //             window.scrollTo(0, this.routeScrollPositions[currRouteEvent.url] || 0);
        //         }
        //     })
        // );
    }

    prepareRoute(outlet: RouterOutlet): any {
        return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
