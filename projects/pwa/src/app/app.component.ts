import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { routeSliderStatePlusMinus, NavigationService, ActiveRequestService,
    ToastService, ErrorService, MigrationService, CloudDropboxService,
    GoogleAnalyticsService, INavigation, ShowNotificationService, IUIShowNotification } from 'common';
import { Subscription, } from 'rxjs';
import { CheckForUpdateService } from './service-workers/check-for-update.service';
import { TvWatchlistService } from './services/tv-watchlist.service';
@Component({
    selector: 'tvq-app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
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
        private tvQSvc: TvWatchlistService,
        private errSvc: ErrorService,
        private migrateSvc: MigrationService,
        private cloudSvc: CloudDropboxService,
        private updateSvc: CheckForUpdateService, // inits CheckForUpdateService
        private gaSvc: GoogleAnalyticsService,
        private showNotifySvc: ShowNotificationService,
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
                name: 'Save',
                icon: 'cloud-upload',
                link: [],
                disabled: !this.cloudSvc.IsAuthenticated,
            },
            // {
            //     name: 'Analytics',
            //     icon: 'pie-chart',
            //     link: ['/analytics']
            // },
            {
                name: 'About',
                icon: 'information-circle',
                link: ['/about']
            },
        ];
    }

    private subscriptions: Subscription[] = [];
    private scrollTop = 0;
    naigationList: INavigation[];
    isHome = false;
    isReady = false;
    showloaderBar = false;

    // this pwa specific
    @HostListener('window:beforeinstallprompt', ['$event'])
    onBeforeInstallPrompt(e:Event) {
      console.log('onBeforeInstallPrompt', e);
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.tvQSvc.deferredInstallPrompt = e as BeforeInstallPromptEvent;
    }

    ngOnInit(): void {
        this.isReady = true;
        this.cdRef.detectChanges();
        this.isHome = this.router.url === '/home';
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

        this.gaSvc.init();
        const sub4 = this.showNotifySvc.subscribe(obj => {
            this.toastSvc.info(`${obj.showName}\n(${obj.time})\n${obj.episodeName}`);
        });
        this.subscriptions.push(sub4);
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

    async onNavClick(nav: INavigation) {
        console.log('onNavClick', nav);
        if(nav.disabled) {
            return;
        }

        if(nav.name === 'Save') {
            const backup = await this.migrateSvc.export();
            this.cloudSvc.upload(backup).subscribe(()=>{
                this.toastSvc.success('Data was uploaded successfully!');
            });
        } else {
            this.router.navigate(nav.link);
        }
    }

    reload(){
        document.location.reload();
    }

    prepareRoute(outlet: RouterOutlet): any {
        return outlet?.activatedRouteData?.index;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
