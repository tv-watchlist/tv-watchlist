import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { slideOutRightOnLeaveAnimation, fadeOutOnLeaveAnimation, slideInRightOnEnterAnimation } from 'angular-animations';
import { SvgIconType, SvgIconComponent } from '../svg-icon/svg-icon.component';

export interface INavigation {
    name: string;
    icon: SvgIconType;
    link: string[];
    disabled?: boolean;
}

@Component({
    selector: 'tvq-navigation',
    standalone: true,
    templateUrl: 'navigation.component.html',
    animations: [slideInRightOnEnterAnimation({ duration: 400 }),
        slideOutRightOnLeaveAnimation({ duration: 400 }),
        fadeOutOnLeaveAnimation({ duration: 400 })],
    imports: [CommonModule, SvgIconComponent]
})
export class NavigationComponent implements OnInit {
    constructor(private elm: ElementRef) { }
    visible = false;

    @Input() options: INavigation[] = []
    @Output() action = new EventEmitter<INavigation>();

    ngOnInit(): void { }

    openMenu(): void {
        this.visible = true;
    }

    closeMenu(): void {
        this.visible = false;
    }

    clicked(option: INavigation): void {
        this.action.emit(option);
        this.closeMenu();
    }
}
