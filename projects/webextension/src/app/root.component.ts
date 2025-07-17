import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
    selector: 'tvq-root',
    template: `<router-outlet></router-outlet>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class RootComponent implements OnInit {
    ngOnInit() {
        console.log('The Root Component');
    }
}
