import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ToastService } from '../widgets/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class HandleUnrecoverableStateService {
    constructor(updates: SwUpdate, toastSvc: ToastService) {
        updates.unrecoverable.subscribe(event => {
            const msg = `An error occurred that we cannot recover from:\n${event.reason}\n\n` +
                'Please reload the page.';
            console.error(msg);
            toastSvc.error(msg);
        });
    }
}
