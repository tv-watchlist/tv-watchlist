import { Component, Inject, OnInit } from '@angular/core';
import { CloudDropboxService, WINDOW } from 'common';

@Component({
    selector: 'tvq-dropbox-redirect',
    templateUrl: 'redirect.component.html'
})
export class DropboxRedirectComponent implements OnInit {
    constructor(@Inject(WINDOW) private window: Window) { }
    ngOnInit() {
        CloudDropboxService.captureResponse(this.window);
    }

    goHome(){
        document.location.href = '/';
    }
}
