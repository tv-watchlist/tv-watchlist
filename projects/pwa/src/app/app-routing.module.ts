import { ViewportScroller } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { CustomReuseStrategy } from './services/cache-route-reuse.strategy';
import { HomeComponent } from './pages/home/home.component';
import { ShowDetailComponent } from './pages/show-detail/show-detail.component';

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/home' },
    { path: 'home', component: HomeComponent, data: { animation: 'isLeft', reuseRoute: true } },
    { path: 'show-detail/:showId', component: ShowDetailComponent, data: { animation: 'isRight' } },
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
