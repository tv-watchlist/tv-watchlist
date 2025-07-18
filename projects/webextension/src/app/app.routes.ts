import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { BackgroundComponent } from './background/background.component';
import { OptionsComponent } from './options/options.component';
import { PopupComponent } from './popup/popup.component';
import { PageNotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
    {
        path: '', // default path
        component: AppComponent,
        children: [
            { path: 'popup', component: PopupComponent, data: { reuseRoute: true, index: 0 } },
            { path: 'options', component: OptionsComponent, data: { reuseRoute: true, index: 0 } },
            { path: 'background', component: BackgroundComponent, data: { reuseRoute: true, index: 0 } },
            { path: '', pathMatch: 'full', redirectTo: '/popup' },
        ]
    },
    {
        path: '**', // wildcard path for 404
        component: PageNotFoundComponent,
    }
];
