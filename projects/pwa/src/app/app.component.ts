import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ActiveRequestService } from './services/active-request.http-interceptor';
import { routeSliderStatePlusMinus } from './services/animations';
import { ErrorService } from './services/error.handler';
import { NavigationService } from './services/navigation.service';
import { INavigation } from './widgets/navigation/navigation.component';
import { ToastService } from './widgets/toast/toast.service';

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
        private navSvc: NavigationService,
        private activeReqSvc: ActiveRequestService,
        private toastSvc: ToastService,
        private errSvc: ErrorService,
        private cdRef: ChangeDetectorRef) {
        const path = localStorage.getItem('path');
        if (path) {
            localStorage.removeItem('path');
            this.router.navigate([path]);
        }
        this.naigationList = [
            {
                name: 'Home',
                icon: 'home',
                link: ['/home']
            },
            {
                name: 'Search',
                icon: 'search',
                link: ['/search']
            },
            {
                name: 'Popular',
                icon: 'sparkles',
                link: ['/popular']
            },
            {
                name: 'Settings',
                icon: 'cog',
                link: ['/setting']
            },
            {
                name: 'About',
                icon: 'information-circle',
                link: ['/about']
            }
        ];
    }

    private subscriptions: Subscription[] = [];
    private scrollTop = 0;
    naigationList: INavigation[];
    isHome = false;
    isReady = false;
    showloaderBar = false;
    ngOnInit(): void {
        this.isReady = true;
        this.cdRef.detectChanges();
        const sub1 = this.navSvc.onBack.subscribe(history => {
            this.isHome = history.url === '/home';
            console.log('pop history', history);
            this.scrollTop = history.position ? history.position[1] : 0;
            this.cdRef.detectChanges();
        });
        this.subscriptions.push(sub1);
        const sub2 = this.activeReqSvc.subscribe(counter => {
            if (counter <= 0) {
                this.showloaderBar = false;
            } else {
                this.showloaderBar = true;
            }
            this.cdRef.detectChanges();
        });
        this.subscriptions.push(sub2);
        const sub3 = this.errSvc.subscribe(err => {
            if (err.type === 'error') {
                this.toastSvc.error(err.message, 10000);
            }
            if (err.type === 'warn') {
                this.toastSvc.warning(err.message, 10000);
            }
        });
        this.subscriptions.push(sub3);
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
