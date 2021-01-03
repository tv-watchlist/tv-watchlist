import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { slideOutRightOnLeaveAnimation, fadeOutOnLeaveAnimation, slideInRightOnEnterAnimation } from 'angular-animations';

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
