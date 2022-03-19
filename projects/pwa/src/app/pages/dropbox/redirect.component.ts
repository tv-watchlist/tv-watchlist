import { Component, OnInit } from '@angular/core';
import { CloudDropboxService } from 'common';

@Component({
    selector: 'tvq-dropbox-redirect',
    templateUrl: 'redirect.component.html'
})
export class DropboxRedirectComponent implements OnInit {
    constructor() { }
    ngOnInit() {
        CloudDropboxService.captureResponse(window.location);
    }

    goHome(){
        document.location.href = '/';
    }
}
