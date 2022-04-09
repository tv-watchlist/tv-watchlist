import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SettingService, LoaderScreenService, ShowService, ShowNotificationService } from 'common';

@Component({
    selector: 'tvq-setting',
    templateUrl: 'setting.component.html'
})
export class SettingComponent implements OnInit {
    constructor(
        private settingSvc: SettingService,
        private showSvc: ShowService,
        private notifySvc: ShowNotificationService,
        private loaderSvc: LoaderScreenService,
        private cdRef: ChangeDetectorRef,
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

    private _enableNotification: boolean = false;
    get enableNotification() {
        return this._enableNotification;
    }

    set enableNotification(val: boolean) {
        this.settingSvc.save('enableNotification', val);
        this._enableNotification = val;
    }

    private _notifyBeforeMin: number = 0;
    get notifyBeforeMin() {
        return this._notifyBeforeMin;
    }

    set notifyBeforeMin(val: number) {
        this._notifyBeforeMin = val;
        this.settingSvc.save('notifyBeforeMin', val);
        // compiler not letting usage of await
        this.showSvc.getAll().then(showList => {
            this.notifySvc.refreshNotifications(showList);
        });
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
        this._enableNotification = settings.enableNotification;
        this._notifyBeforeMin = settings.notifyBeforeMin;
        this.loaderSvc.close();
        this.cdRef.detectChanges();
    }
}
