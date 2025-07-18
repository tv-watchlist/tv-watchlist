import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'tvq-options',
    templateUrl: 'options.component.html',
})

export class OptionsComponent implements OnInit {
    constructor() { }

    ngOnInit() {
        console.log('options');
     }
}
