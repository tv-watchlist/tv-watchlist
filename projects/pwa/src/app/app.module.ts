import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { ShowBannerCardComponent } from './layouts/show-banner-card/show-banner-card.component';
import { DatePipe } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { ShowDetailComponent } from './pages/show-detail/show-detail.component';
import { BackButtonDirective } from './widgets/back-button.directive';

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
        DatePipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
