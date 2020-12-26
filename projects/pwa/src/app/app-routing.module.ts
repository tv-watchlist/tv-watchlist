import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ShowDetailComponent } from './show-detail/show-detail.component';

const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: '/home' },
    { path: 'home', component: HomeComponent, data: { animation: 'isLeft', reuseRoute: true } },
    { path: 'show-detail/:showId', component: ShowDetailComponent, data: { animation: 'isRight' } },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
            scrollPositionRestoration: 'enabled'
        })],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
