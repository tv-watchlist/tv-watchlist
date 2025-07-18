import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { slideInUpOnEnterAnimation, slideOutDownOnLeaveAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { SvgIconComponent } from "../svg-icon/svg-icon.component";

@Component({
    selector: 'tvq-options-menu',
    templateUrl: 'options-menu.component.html',
    animations: [slideInUpOnEnterAnimation({ duration: 400 }),
        slideOutDownOnLeaveAnimation({ duration: 400 }),
        fadeOutOnLeaveAnimation({ duration: 400 })],
    imports: [CommonModule, SvgIconComponent]
})
export class OptionsMenuComponent<T> implements OnInit {
    constructor() { }

    visible = false;
    @Input() header = '';
    @Input() options: T[] = [];
    /**
     * if T is object then the property which can be used as the Id
     */
    @Input() optionsKey?: keyof T;
    /**
     * if T is object then the property which can be used as Label
     */
    @Input() optionsLabel?: (obj: T) => string;
    @Input() default?:T;
    @Output() action = new EventEmitter<T>();

    ngOnInit(): void { }

    openMenu(): void {
        this.visible = true;
    }

    closeMenu(): void {
        this.visible = false;
    }

    getLabel(option: T) {
        if(!!this.optionsLabel && !!option){
            return this.optionsLabel(option);
        }

        return option;
    }

    getKey(option?: T) {
        if(!!this.optionsKey && !!option && option[this.optionsKey]){
            return option[this.optionsKey];
        }

        return option;
    }

    clicked(option: T): void {
        this.action.emit(option);
        this.closeMenu();
    }
}
