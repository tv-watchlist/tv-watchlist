import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { BackButtonDirective } from './back-button.directive';
import { DefaultImageDirective } from './default-img.directive';
import { NavigationComponent } from './navigation/navigation.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { SwitchComponent } from './switch/switch.component';
import { ToastComponent } from './toast/toast.component';
import { SvgIconComponent } from './svg-icon/svg-icon.component';
import { RouterModule } from '@angular/router';

const COMPONENTS: any[] = [
    BackButtonDirective,
    DefaultImageDirective,
    SwitchComponent,
    ToastComponent,
    OptionsMenuComponent,
    NavigationComponent,
    SvgIconComponent,
]

@NgModule({
    declarations: [
        COMPONENTS,
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
    ],
    providers: [
        DatePipe,
    ],
    exports: [
        COMPONENTS,
    ]
})
export class WidgetsModule {
}
