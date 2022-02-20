import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
    selector: 'tvq-button',
    templateUrl: 'button.component.html'
})

export class ButtonComponent implements OnInit {
    constructor() { }
    @Output() click = new EventEmitter<MouseEvent>();

    ngOnInit(): void { }

    onClickButton(event: MouseEvent) {
        event.stopPropagation();
        console.log('button clicked');
        this.click.emit(event);
    }
}
