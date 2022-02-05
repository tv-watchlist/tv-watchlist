import { Component, OnInit } from '@angular/core';
import { MigrationService } from '../../services/migration.service';
import { SettingService } from "../../services/setting.service";

@Component({
    selector: 'tvq-setting',
    templateUrl: 'setting.component.html'
})
export class SettingComponent implements OnInit {
    constructor(
        public settingSvc: SettingService,
        private migrateSvc: MigrationService,
        ) { }

    file?: File | null;
    ngOnInit(): void { }

    handleFileInput(event: Event): void {
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
        reader.onloadend = (evt: ProgressEvent<FileReader>) => {
            if (evt?.target?.readyState === FileReader.DONE) { // DONE == 2
                const fileContent = evt.target.result;
                try {
                    const bakStr = fileContent || '{}';
                    const backup = JSON.parse(bakStr as string);
                    this.migrateSvc.import(backup);
                } catch (e) {
                    console.log('Import Error', e);
                }
            }
        };
        // Read in the image file as a binary string.
        const element = event.currentTarget as HTMLInputElement;
        const file = element?.files?.item(0);
        if (!!file) {
            reader.readAsText(file); // this will trigger above reader's event
        } else {
            console.error('file was empty');
        }
    }
}
