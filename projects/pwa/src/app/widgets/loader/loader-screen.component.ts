import { ChangeDetectorRef, Component, EventEmitter, Injectable, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fadeOutOnLeaveAnimation } from 'angular-animations';
import { LoaderScreenService } from './loader-screen.service';

/**
 * This is going to be a singleton component. That's why including Service to show and hide.
 */
@Component({
    selector: 'tvq-loader-screen',
    templateUrl: 'loader-screen.component.html',
    animations: [fadeOutOnLeaveAnimation({ duration: 400 })]
})
export class LoaderScreenComponent implements OnInit, OnDestroy {
    constructor(private svc: LoaderScreenService, private cdRef: ChangeDetectorRef) { }

    message = '';
    visible = false;

    ngOnInit(): void {
        this.svc.subscribe(({message,status})=>{
            this.message = message;
            this.visible = status;
            this.cdRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.svc.unsubscribe();
    }
}
