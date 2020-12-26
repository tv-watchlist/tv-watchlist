import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { pairwise } from 'rxjs/operators';
import { slider } from './animations';
import { NavigationService } from './navigation.service';

@Component({
    selector: 'tvq-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        slider
        // animation triggers go here
    ]
})
export class AppComponent implements OnInit, OnDestroy {
    constructor(
        private router: Router,
        private appElement: ElementRef,
        private navSvc: NavigationService,
        private cdRef: ChangeDetectorRef) {
    }

    private routeScrollPositions: { [url: string]: number } = {};
    private subscriptions: Subscription[] = [];
    private scrollTop = 0;
    ngOnInit(): void {
        this.navSvc.onBack.subscribe(history => {
            console.log('pop history', history);
            this.scrollTop = history.position ? history.position[1] : 0;
        });
    }

    onActivate(ev: any): void {
        const body = window.document.scrollingElement;
        if (!!body) {
            setTimeout(() => {
                // this scrollTop is only working inside setTimeout????
                body.scrollTop = this.scrollTop;
            });
        }
    }

    prepareRoute(outlet: RouterOutlet): any {
        return outlet?.activatedRouteData?.animation;
    }

    back(): void {
        this.navSvc.back();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
