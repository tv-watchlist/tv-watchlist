import { BrowserModule, HammerGestureConfig, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule } from '@angular/core';

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
import { SwitchComponent } from './widgets/switch/switch.component';
import { ToastComponent } from './widgets/toast/toast.component';
import { OptionsMenuComponent } from './widgets/options-menu/options-menu.component';
import { SettingComponent } from './pages/setting/setting.component';
import { NavigationComponent } from './widgets/navigation/navigation.component';
import { AboutComponent } from './pages/about/about.component';
import { SearchComponent } from './pages/search/search.component';

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
        BackButtonDirective,
        DefaultImageDirective,
        EpisodeComponent,
        SwitchComponent,
        ToastComponent,
        SettingComponent,
        OptionsMenuComponent,
        NavigationComponent,
        AboutComponent,
        SearchComponent,
    ],
    imports: [
        BrowserModule,
        HammerModule,
        BrowserAnimationsModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    providers: [
        DatePipe,
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
