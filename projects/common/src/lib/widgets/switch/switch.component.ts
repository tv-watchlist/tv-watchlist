import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'tvq-switch',
    templateUrl: 'switch.component.html'
})
export class SwitchComponent implements OnInit {
    constructor() { }

    @Input() state = false;

    // [(state)] Output prop name must be Input prop name + 'Change'
    @Output() stateChange = new EventEmitter<boolean>();

    ngOnInit(): void { }
}
