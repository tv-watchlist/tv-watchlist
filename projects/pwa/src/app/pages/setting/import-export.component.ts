import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActiveRequestService, MigrationService } from 'common';

@Component({
    selector: 'tvq-setting-import-export',
    standalone: true,
    templateUrl: 'import-export.component.html'
})
export class SettingImportExportComponent implements OnInit {
    constructor(
        private barSvc: ActiveRequestService,
        private migrateSvc: MigrationService,
        private datePipe: DatePipe,) {
        this.exportFileName = `tv-watchlist-db-v6-${this.datePipe.transform(new Date(),'yyyy-MM-dd')}.txt`;
     }
     exportFileName = ''
    ngOnInit() { }
    handleFileInput(event: Event): void {
        this.barSvc.updateRequestCount(true);
        const reader = new FileReader();
        reader.onerror = () => {};
        reader.onprogress = () => {};
        reader.onabort = (e) => {
            alert('File read cancelled');
        };
        reader.onloadstart = (e) => {
            console.log('loading');
        };

        reader.onload = (e) => {
            // Ensure that the progress bar displays 100% at the end.
            console.log('loading complete!');
        };

        // If we use onloadend, we need to check the readyState.
        reader.onloadend = async (evt: ProgressEvent<FileReader>) => {
            if (evt?.target?.readyState === FileReader.DONE) { // DONE == 2
                const fileContent = evt.target.result;
                try {
                    const bakStr = (fileContent || '{}') as string;
                    await this.migrateSvc.import(bakStr);
                } catch (e) {
                    console.log('Import Error', e);
                }
                this.barSvc.updateRequestCount(false);
            }
        };
        // Read in the image file as a binary string.
        const element = event.currentTarget as HTMLInputElement;
        const file = element?.files?.item(0);
        if (!!file) {
            reader.readAsText(file); // this will trigger above reader's event
        } else {
            console.error('file was empty');
            this.barSvc.updateRequestCount(false);
        }
    }

    async export() {
        this.barSvc.updateRequestCount(true);
        const backup = await this.migrateSvc.export();

        const fileUrl = URL.createObjectURL(new Blob([backup], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.setAttribute("href", fileUrl);

        a.download = this.exportFileName;
        a.click();
        URL.revokeObjectURL(fileUrl);
        this.barSvc.updateRequestCount(false);
    }

}
