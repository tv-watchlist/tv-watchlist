import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BackButtonDirective } from './back-button.directive';
import { DefaultImageDirective } from './default-img.directive';
import { NavigationComponent } from './navigation/navigation.component';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { SwitchComponent } from './switch/switch.component';
import { ToastComponent } from './toast/toast.component';
import { SvgIconComponent } from './svg-icon/svg-icon.component';
import { LoaderScreenComponent } from './loader/loader-screen.component';
import { LoaderBarComponent } from './loader/loader-bar.component';

import { LoaderScreenService } from './loader/loader-screen.service';
import { ToastService } from './toast/toast.service';
import { ButtonComponent } from './button/button.component';

const COMPONENTS: any[] = [
    BackButtonDirective,
    DefaultImageDirective,
    SwitchComponent,
    ToastComponent,
    OptionsMenuComponent,
    NavigationComponent,
    SvgIconComponent,
    LoaderScreenComponent,
    LoaderBarComponent,
    ButtonComponent,
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
    exports: [
        COMPONENTS,
    ]
})
export class WidgetsModule {
    static forRoot(): ModuleWithProviders<WidgetsModule> {
        return {
            ngModule: WidgetsModule,
            providers: [
                LoaderScreenService,
                ToastService,
                DatePipe,
            ]
        };
    }
}
