import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { ShowBannerCardComponent } from './layouts/show-banner-card/show-banner-card.component';
import { CommonModule, DatePipe } from '@angular/common';
import { HomeComponent } from './pages/home/home.component';
import { ShowDetailComponent } from './pages/show-detail/show-detail.component';
import { BackButtonDirective } from './widgets/back-button.directive';
import { EpisodeComponent } from './layouts/episode/episode.component';
import { FormsModule } from '@angular/forms';
import { DefaultImageDirective } from './widgets/default-img.directive';

@NgModule({
    declarations: [
        AppComponent,
        ShowBannerCardComponent,
        HomeComponent,
        ShowDetailComponent,
        BackButtonDirective,
        DefaultImageDirective,
        EpisodeComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    providers: [
        DatePipe
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
