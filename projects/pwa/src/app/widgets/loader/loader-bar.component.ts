import { ChangeDetectorRef, Component, EventEmitter, Injectable, Input, OnChanges, OnInit, Output } from '@angular/core';
import { fadeOutOnLeaveAnimation } from 'angular-animations';

@Component({
    selector: 'tvq-loader-bar',
    templateUrl: 'loader-bar.component.html',
    animations: [fadeOutOnLeaveAnimation({ duration: 400 })]
})
export class LoaderBarComponent implements OnChanges, OnInit {
    constructor(private cdRef: ChangeDetectorRef) { }
    private timer: any;

    @Input() percent = 0;
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Input() indeterminate = true;

    ngOnInit(): void {
        this.setIndeterminate();
    }
    ngOnChanges(): void {
        this.setIndeterminate();
    }

    setIndeterminate(){
        if(!!this.timer) {
            clearInterval(this.timer);
        }
        if(this.indeterminate){
            this.timer = setInterval(() => {
                if(this.percent === 0) {
                    this.percent = 100;
                }else{
                    this.percent = 0;
                }
                // console.log('%',this.percent);
                this.cdRef.markForCheck();
            }, 1000);
        }
        this.cdRef.markForCheck();
    }
}
