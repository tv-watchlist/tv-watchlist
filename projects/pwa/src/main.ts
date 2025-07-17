import { enableProdMode, ErrorHandler, importProvidersFrom, Injectable } from '@angular/core';
import { environment } from './environments/environment';

import 'hammerjs';
import { bootstrapApplication, BrowserModule, HammerGestureConfig, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RootComponent } from './app/root.component';
import { provideRouter, RouterModule, withDebugTracing } from '@angular/router';
import { AppRoutingModule, routes } from './app/app-routing';
import { CommonModule, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ActiveRequestHttpInterceptor, TvQAngularErrorsHandler } from 'common';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

if (environment.production) {
    enableProdMode();
}

@Injectable({providedIn:'root'})
export class HammerConfig extends HammerGestureConfig {
//   overrides = {
//       // I will only use the swap gesture so
//       // I will deactivate the others to avoid overlaps
//       pinch: { enable: false },
//       rotate: { enable: false }
//   };
}

bootstrapApplication(RootComponent, {
    providers: [
        { provide: 'environment', useValue: environment },
        DatePipe,
        [
            { provide: HTTP_INTERCEPTORS, useClass: ActiveRequestHttpInterceptor, multi: true },
        ],
        {
            provide: ErrorHandler,
            useClass: TvQAngularErrorsHandler,
        },
        {
            provide: HAMMER_GESTURE_CONFIG,
            useClass: HammerConfig
        },
        provideRouter(routes,),
        importProvidersFrom(ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
            // AppRoutingModule,
            BrowserModule,
            HammerModule,
            BrowserAnimationsModule,
            FormsModule,
            HttpClientModule,
            CommonModule,)
    ]
}).catch(err => console.error(err));
