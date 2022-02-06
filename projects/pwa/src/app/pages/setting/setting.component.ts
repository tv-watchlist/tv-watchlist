import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IMyTvQFlatV5 } from '../../services/flat-file-v5.model';
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
        private cdRef: ChangeDetectorRef,
        ) { }

    file?: File | null;

    private _hideTba: boolean = false;
    get hideTba() {
        return this._hideTba;
    }

    set hideTba(val: boolean) {
        this.settingSvc.save('hideTba', val);
        this._hideTba = val;
    }

    private _hideSeen: boolean = false;
    get hideSeen() {
        return this._hideSeen;
    }

    set hideSeen(val: boolean) {
        this.settingSvc.save('hideSeen', val);
        this._hideSeen = val;
    }

    private _showsOrder: string = '';
    get showsOrder() {
        return this._showsOrder;
    }

    set showsOrder(val: string) {
        this.settingSvc.save('showsOrder', val);
        this._showsOrder = val;
    }

    private _defaultEpisodes: string = '';
    get defaultEpisodes() {
        return this._defaultEpisodes;
    }

    set defaultEpisodes(val: string) {
        this.settingSvc.save('defaultEpisodes', val);
        this._defaultEpisodes = val;
    }

    async ngOnInit(): Promise<void> {
        const settings = await this.settingSvc.getAll();
        console.log({settings});
        this._hideTba = settings.hideTba;
        this._hideSeen = settings.hideSeen;
        this._showsOrder = settings.showsOrder;
        this._defaultEpisodes = settings.defaultEpisodes;
        this._hideTba = settings.hideTba;
        this.cdRef.detectChanges();
    }

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
                    const bakStr = (fileContent || '{}') as string;
                    const backup = JSON.parse(bakStr) as IMyTvQFlatV5;
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
