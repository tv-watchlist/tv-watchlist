import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CloudDropboxService } from '../../services/api/cloud-dropbox.service';
import { IMyTvQFlatV5 } from '../../services/mytvq/flat-file-v5.model';
import { IMyTvQFlatV6 } from '../../services/mytvq/flat-file-v6.model';
import { MigrationService } from '../../services/mytvq/migration.service';
import { SettingService } from '../../services/mytvq/setting.service';
import { MyTvQDbSetting } from '../../services/storage/db.model';
import { WebDatabaseService } from '../../services/storage/web-database.service';
import { LoaderScreenService } from '../../widgets/loader/loader-screen.service';
import { ToastService } from '../../widgets/toast/toast.service';

@Component({
    selector: 'tvq-setting',
    templateUrl: 'setting.component.html'
})
export class SettingComponent implements OnInit {

    constructor(
        public settingSvc: SettingService,
        private migrateSvc: MigrationService,
        private loaderSvc: LoaderScreenService,
        private cdRef: ChangeDetectorRef,
        private webDbSvc: WebDatabaseService,
        private dropboxSvc: CloudDropboxService,
        private toastSvc: ToastService,
        ) { }

    file?: File | null;
    version: number = 0;

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

    private _episodesOrder: string = '';
    get episodesOrder() {
        return this._episodesOrder;
    }

    set episodesOrder(val: string) {
        this.settingSvc.save('episodesOrder', val);
        this._episodesOrder = val;
    }

    get IsDropboxAuthenticated(){
        return this.dropboxSvc.IsAuthenticated;
    }

    async ngOnInit(): Promise<void> {
        this.loaderSvc.show();
        const settings = await this.settingSvc.getAll();
        console.log({settings});
        this._hideTba = settings.hideTba;
        this._hideSeen = settings.hideSeen;
        this._showsOrder = settings.showsOrder;
        this._episodesOrder = settings.episodesOrder;
        this._hideTba = settings.hideTba;
        this.version =  settings.version;
        this.loaderSvc.close();
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
                    this.migrateSvc.import(bakStr);
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

    async clearDatabase() {
        await this.webDbSvc.clearAllStores();
        await this.settingSvc.saveAll(MyTvQDbSetting.default);
    }

    dropboxLogin(){
        console.log('dropboxLogin');
        if(!this.dropboxSvc.IsAuthenticated){
            window.open(this.dropboxSvc.getAuthenticationUrl(), "dropboxWindow");
        } else {
            console.log(this.dropboxSvc.AccessToken);
            this.dropboxSvc.getCurrentAccountInfo().subscribe(result=>{
                console.log('Dropbox CurrentAccountInfo', result);
            });
        }
    }

    dropboxLoad(){
        console.log('dropboxLoad');
        this.dropboxSvc.download().subscribe(async data=>{
            await this.migrateSvc.importV6(data as IMyTvQFlatV6);
            this.toastSvc.success('Data was successfully loaded!');
        });
    }

    async dropboxSave(){
        const backup = await this.migrateSvc.export();
        this.dropboxSvc.upload(backup).subscribe(()=>{
            this.toastSvc.success('Data was uploaded successfully!');
        });
        console.log('dropboxSave');
    }

    dropboxLogout() {
        this.dropboxSvc.clearDropboxToken();
    }
}
