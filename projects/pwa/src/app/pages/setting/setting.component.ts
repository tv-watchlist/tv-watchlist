import { Component, OnInit } from '@angular/core';
import { SettingService } from '../../services/show.service';

@Component({
    selector: 'tvq-setting',
    templateUrl: 'setting.component.html'
})
export class SettingComponent implements OnInit {
    constructor(public settingSvc: SettingService) { }

    ngOnInit() { }
}
