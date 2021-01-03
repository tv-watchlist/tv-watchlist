import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { fadeOutOnLeaveAnimation, slideInUpOnEnterAnimation, slideOutDownOnLeaveAnimation } from 'angular-animations';

@Component({
    selector: 'tvq-toast',
    templateUrl: 'toast.component.html',
    animations: [slideInUpOnEnterAnimation({ duration: 400 }),
    slideOutDownOnLeaveAnimation({ duration: 400 }),
    fadeOutOnLeaveAnimation({ duration: 400 })]
})
export class ToastComponent implements OnInit {
    constructor() { }

    @Input() message = 'Sample message!';
    @Input() visible = false;
    @Output() action = new EventEmitter<void>();

    ngOnInit(): void { }
}
