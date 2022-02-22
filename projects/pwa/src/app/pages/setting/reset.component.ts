import { Component, OnInit } from '@angular/core';
import { ActiveRequestService } from '../../services/active-request.http-interceptor';
import { SettingService } from '../../services/mytvq/setting.service';
import { MyTvQDbSetting } from '../../services/storage/db.model';
import { WebDatabaseService } from '../../services/storage/web-database.service';

@Component({
    selector: 'tvq-setting-reset',
    templateUrl: 'reset.component.html'
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
