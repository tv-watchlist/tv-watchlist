import { BrowserModule, HammerGestureConfig, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, Injectable, Injector, isDevMode, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ShowBannerCardComponent } from './layouts/show-banner-card/show-banner-card.component';
import { DatePipe } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { ShowDetailComponent } from './pages/show-detail/show-detail.component';
import { EpisodeComponent } from './layouts/episode/episode.component';
import { FormsModule } from '@angular/forms';
import { SettingComponent } from './pages/setting/setting.component';
import { AboutComponent } from './pages/about/about.component';
import { SearchComponent } from './pages/search/search.component';
import { PopularComponent } from './pages/popular/popular.component';
import { WidgetsModule } from './widgets/widgets.module';
import { ActiveRequestHttpInterceptor } from './services/active-request.http-interceptor';
import { TvQAngularErrorsHandler } from './services/error.handler';

@Injectable()
export class HammerConfig extends HammerGestureConfig {
//   overrides = {
//       // I will only use the swap gesture so
//       // I will deactivate the others to avoid overlaps
//       pinch: { enable: false },
//       rotate: { enable: false }
//   };
}

@NgModule({
    declarations: [
        AppComponent,
        ShowBannerCardComponent,
        HomeComponent,
        ShowDetailComponent,
        EpisodeComponent,
        SettingComponent,
        AboutComponent,
        SearchComponent,
        PopularComponent,
    ],
    imports: [
        BrowserModule,
        HammerModule,
        BrowserAnimationsModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        WidgetsModule.forRoot(),
    ],
    providers: [
        DatePipe,
        [
            { provide: HTTP_INTERCEPTORS, useClass: ActiveRequestHttpInterceptor, multi: true },
        ],
        {
            provide: ErrorHandler,
            useClass: TvQAngularErrorsHandler,
        }
        // {
        //     provide: HAMMER_GESTURE_CONFIG,
        //     useClass: HammerConfig
        //   }
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
