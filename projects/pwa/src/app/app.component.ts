import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { pairwise } from 'rxjs/operators';
import { slider } from './services/animations';
import { NavigationService } from './services/navigation.service';
import { ShowService } from './services/show.service';

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
        private route: ActivatedRoute,
        private appElement: ElementRef,
        private navSvc: NavigationService,
        private showSvc: ShowService,
        private cdRef: ChangeDetectorRef) {
    }

    private subscriptions: Subscription[] = [];
    private scrollTop = 0;
    isHome = false;
    ngOnInit(): void {
        this.navSvc.onBack.subscribe(history => {
            this.isHome = history.url === '/home';
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

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
