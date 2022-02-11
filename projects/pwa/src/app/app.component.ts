import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { routeSliderStatePlusMinus } from './services/animations';
import { NavigationService } from './services/navigation.service';
import { TvWatchlistService } from './services/tv-watchlist.service';
import { INavigation } from './widgets/navigation/navigation.component';

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
        this.naigationList = [
            {
                name:'Home',
                icon:'home',
                link:['/home']
            },
            {
                name:'Search',
                icon:'search',
                link:['/search']
            },
            {
                name:'Popular',
                icon:'sparkles',
                link:['/popular']
            },
            {
                name:'Settings',
                icon:'cog',
                link:['/setting']
            },
            {
                name:'About',
                icon:'information-circle',
                link:['/about']
            }
        ];
    }
    private subscriptions: Subscription[] = [];
    private scrollTop = 0;
    naigationList: INavigation[];
    isHome = false;
    isReady = false;
    test = false;
    ngOnInit(): void {
        this.isReady = true;
        this.cdRef.detectChanges();
        this.navSvc.onBack.subscribe(history => {
            this.isHome = history.url === '/home';
            console.log('pop history', history);
            this.scrollTop = history.position ? history.position[1] : 0;
            this.cdRef.detectChanges();
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
