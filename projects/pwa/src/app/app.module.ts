import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { ShowBannerCardComponent } from './show-banner-card/show-banner-card.component';
import { DatePipe, ViewportScroller } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { ShowDetailComponent } from './show-detail/show-detail.component';
import { Router, RouteReuseStrategy, Scroll } from '@angular/router';
import { CustomReuseStrategy } from './cache-route-reuse.strategy';
import { filter } from 'rxjs/operators';
import { BackButtonDirective } from './back-button.directive';

@NgModule({
    declarations: [
        AppComponent,
        ShowBannerCardComponent,
        HomeComponent,
        ShowDetailComponent,
        BackButtonDirective,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    providers: [
        DatePipe,
        {
            provide: RouteReuseStrategy,
            useClass: CustomReuseStrategy
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor(router: Router, viewportScroller: ViewportScroller) {
        // router.events.pipe(
        //     filter((e): e is Scroll => e instanceof Scroll)
        // ).subscribe((e: Scroll) => {
        //     if (e.position) {
        //         // backward navigation
        //         console.log('backward navigation', e.position);
        //         viewportScroller.scrollToPosition(e.position);
        //     } else if (e.anchor) {
        //         // anchor navigation
        //         console.log('anchor navigation', e.anchor);
        //         viewportScroller.scrollToAnchor(e.anchor);
        //     } else {
        //         // forward navigation
        //         console.log('forward navigation', e.anchor);
        //         viewportScroller.scrollToPosition([0, 0]);
        //     }
        // });
    }
}
