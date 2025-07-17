import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'tvq-background',
    templateUrl: 'background.component.html',
    standalone: false
})
export class BackgroundComponent implements OnInit {
    constructor() { }

    ngOnInit() {
        console.log('background');
    }
}
