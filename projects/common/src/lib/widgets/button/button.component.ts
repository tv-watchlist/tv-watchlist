import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
    selector: 'tvq-button',
    templateUrl: 'button.component.html'
})
export class ButtonComponent implements OnChanges {
    constructor() { }
    @Output() clicked = new EventEmitter<MouseEvent>();
    @Input() isDisabled = false;
    ngOnChanges(): void {

    }

    onClickButton(event: MouseEvent) {
        event.stopPropagation();
        console.log('button clicked');
        this.clicked.emit(event);
    }
}
