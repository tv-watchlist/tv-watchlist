import { ViewportScroller } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShowDetailComponent } from './pages/show-detail/show-detail.component';
import { SettingComponent } from './pages/setting/setting.component';
import { AboutComponent } from './pages/about/about.component';
import { SearchComponent } from './pages/search/search.component';
import { PopularComponent } from './pages/popular/popular.component';

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/home' },
    { path: 'home', component: HomeComponent, data: { reuseRoute: true, index: 0 } },
    { path: 'popular', component: PopularComponent, data: { index: 1 } },
    { path: 'show-detail/:showId', component: ShowDetailComponent, data: { index: 2 } },
    { path: 'search', component: SearchComponent, data: { index: 3 } },
    { path: 'setting', component: SettingComponent, data: { index: 4 } },
    { path: 'about', component: AboutComponent, data: { index: 5 } },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        scrollPositionRestoration: 'enabled'
    })],
    // providers:[{
    //     provide: RouteReuseStrategy,
    //     useClass: CustomReuseStrategy
    // }],
    exports: [RouterModule]
})
export class AppRoutingModule {
    constructor(router: Router, viewportScroller: ViewportScroller) {
        const body = window.document.scrollingElement;
        // router.events.pipe(
        //     filter((e): e is Scroll => e instanceof Scroll)
        // ).subscribe((e: Scroll) => {
        //     console.log('backward navigation', e.routerEvent.urlAfterRedirects, e.position, e.anchor);
        //     if (e.position) {
        //         // backward navigation
        //         console.log('backward navigation');
        //         // if (!!body) {
        //         //     const position = e.position;
        //         //     setTimeout(() => {
        //         //         viewportScroller.scrollToPosition(position);
        //         //         // body.scrollTop = position[1];
        //         //     }, 500);
        //         // }
        //     } else if (e.anchor) {
        //         // anchor navigation
        //         console.log('anchor navigation');
        //         // viewportScroller.scrollToAnchor(e.anchor);
        //     } else {
        //         // forward navigation
        //         console.log('forward navigation');
        //         // viewportScroller.scrollToPosition([0, 0]);
        //     }
        // });
    }
}
