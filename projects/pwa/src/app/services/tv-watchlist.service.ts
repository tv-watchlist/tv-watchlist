import { Inject, Injectable } from '@angular/core';
import { NAVIGATOR, WINDOW } from 'common';

// import { IMyTvQFlatV5 } from './flat-file-v5.model';
@Injectable({ providedIn: 'root' })
export class TvWatchlistService {
    constructor(@Inject(WINDOW) private window: Window,
    @Inject(NAVIGATOR) private navigator: Navigator
    ) {
        this.now = new Date().getTime();
    }
    deferredInstallPrompt?: BeforeInstallPromptEvent;
    now: number;
    async addToHomeScreen() {
        console.log('adding to homescreen');
        // Show the prompt
        await this.deferredInstallPrompt?.prompt();
        // Wait for the user to respond to the prompt
        await this.deferredInstallPrompt?.userChoice
            .then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                this.deferredInstallPrompt = undefined;
            });
    }

    // Detects if device is on iOS
    get IsIos() {
        return this.navigator.userAgent.match(/Mac/) && this.navigator.maxTouchPoints && this.navigator.maxTouchPoints > 2;
    }

    // Detects if device is in standalone mode
    get IsInStandaloneMode() {
        if ('standalone' in this.navigator) {
            return (this.navigator as any).standalone;
        }
        return (this.window.matchMedia && this.window.matchMedia('(display-mode: standalone)').matches);
    }

    get Browser() {
        // Opera 8.0+
        const isOpera = (!!this.window.opr && !!opr.addons) || !!this.window.opera || this.navigator.userAgent.indexOf(' OPR/') >= 0;

        // Firefox 1.0+
        const isFirefox = typeof InstallTrigger !== 'undefined';

        // Safari 3.0+ "[object HTMLElementConstructor]"
        const isSafari = /constructor/i.test(this.window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })
            (!this.window['safari'] || (typeof safari !== 'undefined' && this.window['safari'].pushNotification));

        // Internet Explorer 6-11
        const isIE = /*@cc_on!@*/false || !!document.documentMode;

        // Edge 20+
        const isEdge = !isIE && !!this.window.StyleMedia;

        // Chrome 1 - 79
        const isChrome = !!this.window.chrome && (!!this.window.chrome.webstore || !!this.window.chrome.runtime);

        // Edge (based on chromium) detection
        const isEdgeChromium = isChrome && (this.navigator.userAgent.indexOf("Edg") != -1);

        // Blink engine detection
        const isBlink = (isChrome || isOpera) && !!('CSS' in this.window);

        let output = '';
        output += 'isFirefox: ' + isFirefox ;
        output += ', isChrome: ' + isChrome ;
        output += ', isSafari: ' + isSafari ;
        output += ', isOpera: ' + isOpera ;
        output += ', isIE: ' + isIE ;
        output += ', isEdge: ' + isEdge ;
        output += ', isEdgeChromium: ' + isEdgeChromium ;
        output += ', isBlink: ' + isBlink ;
        return output;
    }
}
