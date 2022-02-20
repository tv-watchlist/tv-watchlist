import { Component, EventEmitter, HostBinding, Input, OnChanges, OnInit, Output } from '@angular/core';

// https://heroicons.dev/
export type SvgIconType = 'home' | 'search'| 'sparkles' |
                          'cog' | 'information-circle' | 'solid-exclamation-circle' |
                          'chevron-left' | 'menu' | 'check-circle' |
                          'chevron-down' | 'external-link' | 'solid-plus-circle' |
                          'chevron-right' | 'check' | 'refresh' | 'trash' | 'dots-vertical' |
                          'exclamation-circle' | 'x' | 'ios-share';

@Component({
    selector: 'tvq-svg-icon',
    templateUrl: 'svg-icon.component.html'
})
export class SvgIconComponent implements OnChanges {
    constructor() { }

    @Input() icon: SvgIconType = 'home';
    @Input() size: '12' | '8' | '7' | '6' | '4' = '7';
    @Input() classes: string = '';

    classComposed = '';
    iconSizes: {[size: string]: string} = {
        '12': 'w-12 h-12',
        '8': 'w-8 h-8',
        '7': 'w-7 h-7',
        '6': 'w-6 h-6',
        '4': 'w-4 h-4',
    };

    ngOnChanges(): void {
        // console.log(this.icon, this.classes , this.iconSizes[this.size]);
        this.classComposed += this.classes + ' '+ this.iconSizes[this.size];
    }
}
