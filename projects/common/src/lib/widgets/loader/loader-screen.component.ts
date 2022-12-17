import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Injectable, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fadeOutOnLeaveAnimation } from 'angular-animations';
import { LoaderScreenService } from './loader-screen.service';

/**
 * This is going to be a singleton component. That's why including Service to show and hide.
 */
@Component({
    selector: 'tvq-loader-screen',
    standalone: true,
    imports: [CommonModule],
    templateUrl: 'loader-screen.component.html',
    animations: [fadeOutOnLeaveAnimation({ duration: 400 })]
})
export class LoaderScreenComponent implements OnInit, OnDestroy {
    constructor(private svc: LoaderScreenService, private cdRef: ChangeDetectorRef) { }

    message = '';
    visible = false;
    showClose = false;
    timerHandler?: any;
    ngOnInit(): void {
        this.svc.subscribe(({ message, status }) => {
            this.message = message;
            this.visible = status;
            if (this.visible) {
               this.timerHandler = setTimeout(() => {
                    this.showClose = true;
                    this.cdRef.markForCheck();
                }, 1000 * 30);
            } else {
                if(this.timerHandler) {
                    clearTimeout(this.timerHandler);}
            }

            this.cdRef.markForCheck();
        });
    }

    close() {
        this.svc.close();
    }

    ngOnDestroy(): void {

        this.svc.unsubscribe();
    }
}
