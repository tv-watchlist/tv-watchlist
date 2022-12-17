import { Component, OnInit } from '@angular/core';
import { SettingService, WebDatabaseService, ActiveRequestService, MyTvQDbSetting,OptionsMenuComponent
 } from 'common';

@Component({
    selector: 'tvq-setting-reset',
    standalone: true,
    templateUrl: 'reset.component.html',
    imports: [OptionsMenuComponent]
})
export class SettingsResetComponent implements OnInit {
    constructor(
        public settingSvc: SettingService,
        private webDbSvc: WebDatabaseService,
        private barSvc: ActiveRequestService,
    ) { }

    ngOnInit() { }

    async clearDatabase() {
        this.barSvc.updateRequestCount(true);
        await this.webDbSvc.clearAllStores();
        await this.settingSvc.saveAll(MyTvQDbSetting.default);
        this.barSvc.updateRequestCount(false);
    }
}
