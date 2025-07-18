import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { ActiveRequestHttpInterceptor, TvQAngularErrorsHandler } from 'common';
import { routes } from './app.routes';


export const appConfig: ApplicationConfig = {
  providers: [
    DatePipe,
    [
      { provide: HTTP_INTERCEPTORS, useClass: ActiveRequestHttpInterceptor, multi: true },
    ],
    {
        provide: ErrorHandler,
        useClass: TvQAngularErrorsHandler,
    },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    // provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};

// @NgModule({
//     imports: [RouterModule.forRoot(routes, {
//         scrollPositionRestoration: 'enabled'
//     })],
//     // providers:[{
//     //     provide: RouteReuseStrategy,
//     //     useClass: CustomReuseStrategy
//     // }],
//     exports: [RouterModule]
// })
// export class AppRoutingModule { }

//     DatePipe,
//     BrowserModule,
//     BrowserAnimationsModule,
//     FormsModule,
//     provideHttpClient(withInterceptorsFromDi()),
//     CommonModule,)
