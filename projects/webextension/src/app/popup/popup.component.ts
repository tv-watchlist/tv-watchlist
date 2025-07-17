import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'tvq-popup',
    templateUrl: 'popup.component.html',
    standalone: false
})

export class PopupComponent implements OnInit {
    constructor() { }

    ngOnInit() {
        console.log('popup');
    }
}
