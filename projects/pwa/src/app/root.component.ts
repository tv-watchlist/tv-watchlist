import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, Injectable, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'tvq-root',
    standalone: true,
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootComponent implements OnInit {
    ngOnInit() {
        console.log('The Root Component');
    }
}
