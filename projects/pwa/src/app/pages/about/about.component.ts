import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'tvq-about',
    templateUrl: 'about.component.html'
})

export class AboutComponent implements OnInit {
    constructor() { }

    ngOnInit(): void { }

    goToUrl(url: string): void {
        window.open(url, '_blank');
    }
}
