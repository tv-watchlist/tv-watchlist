import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { slideOutRightOnLeaveAnimation, fadeOutOnLeaveAnimation, slideInRightOnEnterAnimation } from 'angular-animations';
import { SvgIconType } from '../svg-icon/svg-icon.component';

export interface INavigation {
    name: string;
    icon:SvgIconType;
    link: string[];
}

@Component({
    selector: 'tvq-navigation',
    templateUrl: 'navigation.component.html',
    animations: [slideInRightOnEnterAnimation({ duration: 400 }),
        slideOutRightOnLeaveAnimation({ duration: 400 }),
        fadeOutOnLeaveAnimation({ duration: 400 })]
})
export class NavigationComponent implements OnInit {
    constructor(private elm: ElementRef) { }
    visible = false;

    @Input() options: INavigation[] = []
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
