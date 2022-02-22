import { ApplicationRef, ChangeDetectorRef, Component, EventEmitter, Injectable, Input, OnChanges, OnInit, Output } from '@angular/core';
import { fadeOutOnLeaveAnimation } from 'angular-animations';
import { concat, first, interval, Subscription } from 'rxjs';

@Component({
    selector: 'tvq-loader-bar',
    templateUrl: 'loader-bar.component.html',
    animations: [fadeOutOnLeaveAnimation({ duration: 400 })]
})
export class LoaderBarComponent implements OnChanges, OnInit {
    constructor(private cdRef: ChangeDetectorRef,private appRef: ApplicationRef) { }
    private timer?: Subscription;

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
        if(this.indeterminate) {
            if(this.visible) {
                this.timer = interval(1 * 1000).subscribe(obj=>{
                    if(this.percent === 0) {
                        this.percent = 100;
                    }else{
                        this.percent = 0;
                    }
                    this.cdRef.markForCheck();
                });
            } else {
                if(!!this.timer) {
                    this.timer.unsubscribe();
                    this.percent = 0;
                }
            }
        } else {
            if(!!this.timer) {
                this.timer.unsubscribe();
                this.percent = 0;
            }
        }
        this.cdRef.markForCheck();
    }
}
