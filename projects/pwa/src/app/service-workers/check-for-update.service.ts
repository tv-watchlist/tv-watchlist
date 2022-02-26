import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, VersionDetectedEvent, VersionEvent, VersionInstallationFailedEvent, VersionReadyEvent } from '@angular/service-worker';
import { concat, interval, first, map, from, switchMap, catchError, of, tap } from 'rxjs';
import { ToastService } from '../widgets/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class CheckForUpdateService {

    constructor(private appRef: ApplicationRef, private updates: SwUpdate, private toastSvc: ToastService) {
        console.log('CheckForUpdateService constructor');
        // Allow the app to stabilize first, before starting polling for updates with `interval()`.
        let appIsStable$ = appRef.isStable.pipe(
            first(isStable => isStable === true),
            map(o => {
                console.log('appIsStable called');
                return {source:1, result:o};
            })
        );
        const verUpdates$ = updates.versionUpdates.pipe(map(o => {
            return {source:2, result:o};
        }));

        const everySixHours$ = interval(6 * 60 * 60 * 1000).pipe(map(o => {
            return {source:3, result:o};
        }));

        concat(appIsStable$, verUpdates$, everySixHours$).subscribe(async data => {
            console.log('CheckForUpdateService', data.source);
            if(data.source === 2){
                const event = data.result as VersionEvent;
                if(event.type === 'VERSION_DETECTED'){
                    const evt = event as VersionDetectedEvent;
                    console.log('new Version Detected.', evt);
                    toastSvc.info('new Version Detected. Fetching...');
                    // maybe trigger a backup of data for safety
                }
                if(event.type === 'VERSION_INSTALLATION_FAILED'){
                    const evt = event as VersionInstallationFailedEvent;
                    console.log('new Version Install failed.', evt);
                    toastSvc.error('new Version Install failed.');
                    // log this to indexeddb for diagnostics
                }
                if(event.type === 'VERSION_READY'){
                    const evt = event as VersionReadyEvent;
                    console.log('current version is', evt.currentVersion);
                    console.log('available version is', evt.latestVersion);
                    toastSvc.confirm('New version has been downloaded and is ready for activation. Update?').subscribe(async yn => {
                        if(!!yn){
                            try {
                                await updates.activateUpdate().then(() => document.location.reload());
                            } catch (_) {
                                // not in pwa mode
                            }
                        }
                    });
                }
            }
            if(data.source === 1 || data.source === 3){
                console.log('checking for updates');
                try{
                    await updates.checkForUpdate();
                }catch(_){
                    // not in pwa mode
                }
            }
        });
    }

    async checkForUpdate() {
        try{
            return await this.updates.checkForUpdate();
        }catch(_){
            return false; // not in pwa mode
        }
    }
}
