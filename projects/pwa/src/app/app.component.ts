import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { routeSliderStatePlusMinus } from './services/animations';
import { NavigationService } from './services/navigation.service';
import { ShowService, TvWatchlistService } from './services/show.service';

@Component({
    selector: 'tvq-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        routeSliderStatePlusMinus,
    ]
})
export class AppComponent implements OnInit, OnDestroy {
    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private tvSvc: TvWatchlistService,
        private navSvc: NavigationService,
        private cdRef: ChangeDetectorRef) {
        const path = localStorage.getItem('path');
        if (path) {
            localStorage.removeItem('path');
            this.router.navigate([path]);
        }
    }
    private subscriptions: Subscription[] = [];
    private scrollTop = 0;
    isHome = false;
    isReady = false;
    test = false;
    ngOnInit(): void {
        this.tvSvc.initAll().subscribe(() => {
            this.isReady = true;
        });
        this.navSvc.onBack.subscribe(history => {
            this.isHome = history.url === '/home';
            console.log('pop history', history);
            this.scrollTop = history.position ? history.position[1] : 0;
        });
        // this.routeTrigger$ = this.router.events.pipe(
        //     filter(event => event instanceof NavigationEnd),
        //     map(() => this.activatedRoute.firstChild),
        //     switchMap(route => route && route.data || of(null)),
        //     map(d => !!d ? d.index : 0),
        //     tap(d => {
        //         console.log('routeTrigger', d);
        //     })
        // );
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
        return outlet?.activatedRouteData?.index;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
