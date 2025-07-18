import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'tvq-root',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [RouterOutlet],
    template: `<h1>Hello, {{ title() }}</h1>
    <router-outlet></router-outlet>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RootComponent implements OnInit {
    protected readonly title = signal('pwa');
    ngOnInit() {
        console.log('The Root Component');
    }
}
