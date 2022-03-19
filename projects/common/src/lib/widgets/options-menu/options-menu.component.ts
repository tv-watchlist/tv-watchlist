import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { slideInUpOnEnterAnimation, slideOutDownOnLeaveAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';

@Component({
    selector: 'tvq-options-menu',
    templateUrl: 'options-menu.component.html',
    animations: [slideInUpOnEnterAnimation({ duration: 400 }),
        slideOutDownOnLeaveAnimation({ duration: 400 }),
        fadeOutOnLeaveAnimation({ duration: 400 })]
})
export class OptionsMenuComponent implements OnInit {
    constructor() { }

    visible = false;
    @Input() header = '';
    @Input() options: string[] = [];
    @Input() default = '';
    @Output() action = new EventEmitter<string>();

    ngOnInit(): void { }

    openMenu(): void {
        this.visible = true;
    }

    closeMenu(): void {
        this.visible = false;
    }

    clicked(option: string): void {
        this.action.emit(option);
        this.closeMenu();
    }
}
