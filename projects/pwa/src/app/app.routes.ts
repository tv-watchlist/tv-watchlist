
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShowDetailComponent } from './pages/show-detail/show-detail.component';
import { SettingComponent } from './pages/setting/setting.component';
import { AboutComponent } from './pages/about/about.component';
import { SearchComponent } from './pages/search/search.component';
import { PopularComponent } from './pages/popular/popular.component';
import { DropboxRedirectComponent } from './pages/dropbox/redirect.component';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './pages/not-found/not-found.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';

export const routes: Routes = [
    {
        path: '', // default path
        component: AppComponent,
        data: {},
        children: [
            { path: 'home', component: HomeComponent, data: { reuseRoute: true, index: 0 } },
            { path: 'popular', component: PopularComponent, data: { index: 1 } },
            { path: 'show-detail/:showId', component: ShowDetailComponent, data: { index: 2 } },
            { path: 'search', component: SearchComponent, data: { index: 3 } },
            { path: 'setting', component: SettingComponent, data: { index: 4 } },
            { path: 'analytics', component: AnalyticsComponent, data: { index: 5 } },
            { path: 'about', component: AboutComponent, data: { index: 5 } },
            { path: '', pathMatch: 'full', redirectTo: '/home' },
        ]
    },
    {
        path: 'dropbox-redirect',
        component: DropboxRedirectComponent,
    },
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
    },
    {
        path: '**', // wildcard path for 404
        component: PageNotFoundComponent,
    }
];
