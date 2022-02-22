import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'tvq-page-not-found',
    templateUrl: 'not-found.component.html'
})
export class PageNotFoundComponent implements OnInit {
    constructor() { }
    ngOnInit() {

    }

    goHome(){
        document.location.href = '/';
    }
}
