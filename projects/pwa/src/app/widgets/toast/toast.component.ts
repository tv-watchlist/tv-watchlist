import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fadeOutOnLeaveAnimation, slideInUpOnEnterAnimation, slideOutDownOnLeaveAnimation } from 'angular-animations';
import { ToastModel, ToastService } from './toast.service';
/**
 * This is going to be a singleton component. That's why including Service to show and hide.
 */
@Component({
    selector: 'tvq-toast',
    templateUrl: 'toast.component.html',
    animations: [slideInUpOnEnterAnimation({ duration: 400 }),
    slideOutDownOnLeaveAnimation({ duration: 400 }),
    fadeOutOnLeaveAnimation({ duration: 400 })]
})
export class ToastComponent implements OnInit, OnDestroy {
    constructor(private toastSvc: ToastService,
            private cdRef: ChangeDetectorRef) { }

    type: 'success' | 'info' | 'warn' | 'error' = 'info';

    toasts: ToastModel[] = [];
    index: number = 0;

    typeClasses = {
        success: 'text-white bg-green-600' ,
        info: 'text-white bg-gray-600' ,
        warn: 'text-white bg-yellow-500' ,
        error: 'text-white bg-red-600' ,
    }

    typeLablelClasses = {
        success: 'text-white bg-green-800' ,
        info: 'text-white bg-gray-800' ,
        warn: 'text-white bg-yellow-600' ,
        error: 'text-white bg-red-800' ,
    }

    ngOnInit(): void {
        this.toastSvc.subscribe((value: ToastModel) => {
            this.toasts.push(value);
            this.cdRef.markForCheck();
        });

        // this.message = value.message;
        //     this.type = value.type;
        //     setTimeout(() => {
        //         this.close();
        //     }, value.life);
    }

    next() {
        this.index++;
        if(this.index >= this.toasts.length) {
            this.index = this.toasts.length - 1;
        }
        this.cdRef.markForCheck();
    }

    previous() {
        this.index--;
        if(this.index < 0) {
            this.index = 0;
        }
        this.cdRef.markForCheck();
    }

    close() {
        this.toasts = [];
        this.index = 0;
        this.cdRef.markForCheck();
    }

    ngOnDestroy(): void {
        this.toastSvc.unsubscribe()
    }
}
