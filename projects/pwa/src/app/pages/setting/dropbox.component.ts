import { Component, OnInit } from '@angular/core';
import { ActiveRequestService } from '../../services/active-request.http-interceptor';
import { CloudDropboxService } from '../../services/api/cloud-dropbox.service';
import { IMyTvQFlatV6 } from '../../services/mytvq/flat-file-v6.model';
import { MigrationService } from '../../services/mytvq/migration.service';
import { ToastService } from '../../widgets/toast/toast.service';

@Component({
    selector: 'tvq-setting-dropbox',
    templateUrl: 'dropbox.component.html'
})

export class SettingDropboxComponent implements OnInit {
    constructor(
        private dropboxSvc: CloudDropboxService,
        private migrateSvc: MigrationService,
        private barSvc: ActiveRequestService,
        private toastSvc: ToastService,) { }

    get IsDropboxAuthenticated() {
        return this.dropboxSvc.IsAuthenticated;
    }

    ngOnInit() { }

    dropboxLogin() {
        console.log('dropboxLogin');
        if (!this.dropboxSvc.IsAuthenticated) {
            window.open(this.dropboxSvc.getAuthenticationUrl(), "dropboxWindow");
        } else {
            console.log(this.dropboxSvc.AccessToken);
            this.dropboxSvc.getCurrentAccountInfo().subscribe(result => {
                console.log('Dropbox CurrentAccountInfo', result);
            });
        }
    }

    dropboxLoad() {
        console.log('dropboxLoad');
        this.barSvc.updateRequestCount(true);
        this.dropboxSvc.download().subscribe({
            next: async data => {
                await this.migrateSvc.importV6(data as IMyTvQFlatV6);
                this.toastSvc.success('Data was successfully loaded!');
            }, complete: () => {
                this.barSvc.updateRequestCount(false);
            }
        });
    }

    async dropboxSave() {
        this.barSvc.updateRequestCount(true);
        const backup = await this.migrateSvc.export();
        this.dropboxSvc.upload(backup).subscribe({
            next: () => {
                this.toastSvc.success('Data was uploaded successfully!');
            },
            complete: () => {
                this.barSvc.updateRequestCount(false);
            }
        });
        console.log('dropboxSave');
    }

    dropboxLogout() {
        this.dropboxSvc.clearDropboxToken();
    }
}
