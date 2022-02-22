import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActiveRequestService } from '../../services/active-request.http-interceptor';
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
        private loaderSvc: LoaderScreenService,
        private cdRef: ChangeDetectorRef,
        ) {
        }

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
}
