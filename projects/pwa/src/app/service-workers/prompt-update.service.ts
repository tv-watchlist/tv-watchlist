import { Injectable } from '@angular/core';
import { SwUpdate, VersionDetectedEvent, VersionInstallationFailedEvent, VersionReadyEvent } from '@angular/service-worker';
import { ToastService } from '../widgets/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class PromptUpdateService {

    constructor(updates: SwUpdate, toastSvc: ToastService) {
        updates.versionUpdates.subscribe(event => {
            if(event.type === 'VERSION_DETECTED'){
                const evt = event as VersionDetectedEvent;
                console.log('new Version Detected.', evt);
                // maybe trigger a backup of data for safety
            }
            if(event.type === 'VERSION_INSTALLATION_FAILED'){
                const evt = event as VersionInstallationFailedEvent;
                console.log('new Version Install failed.', evt);
                // log this to indexeddb for diagnostics
            }
            if(event.type === 'VERSION_READY'){
                const evt = event as VersionReadyEvent;
                console.log('current version is', evt.currentVersion);
                console.log('available version is', evt.latestVersion);
                toastSvc.confirm('New version has been downloaded and is ready for activation. Update?').subscribe(yn => {
                    if(!!yn){
                        updates.activateUpdate().then(() => document.location.reload());
                    }
                });
            }
        });
    }
}
