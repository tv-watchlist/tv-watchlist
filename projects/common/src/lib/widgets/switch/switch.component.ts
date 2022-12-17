import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'tvq-switch',
    standalone: true,
    templateUrl: 'switch.component.html',
    imports: [CommonModule, FormsModule]
})
export class SwitchComponent implements OnInit {
    constructor() { }

    @Input() state = false;

    // [(state)] Output prop name must be Input prop name + 'Change'
    @Output() stateChange = new EventEmitter<boolean>();

    ngOnInit(): void { }
}
