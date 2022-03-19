import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
    confirmToasts: ToastModel[] = [];
    index: number = 0;

    toastsUI: ToastModel[] = [];

    typeClasses = {
        success: 'text-white bg-green-600' ,
        info: 'text-white bg-gray-600' ,
        warn: 'text-white bg-yellow-500' ,
        error: 'text-white bg-red-600' ,
    };

    typeLablelClasses = {
        success: 'text-white bg-green-800' ,
        info: 'text-white bg-gray-800' ,
        warn: 'text-white bg-yellow-600' ,
        error: 'text-white bg-red-800' ,
    };

    ngOnInit(): void {
        this.toastSvc.subscribe((value: ToastModel) => {
            if(!value.confirm$) {
                this.toasts.push(value);
            } else {
                this.confirmToasts.push(value);
            }
            this.toastsUI = [...this.confirmToasts,...this.toasts];
            this.index = 0;
            this.cdRef.markForCheck();
        });

        // if(this.confirmToasts.length > 0){
        //     this.model = this.confirmToasts.pop();
        // } else if ( this.toasts.length > 0) {
        //     this.model = this.toasts.pop();
        // }

        // this.message = value.message;
        //     this.type = value.type;
        //     setTimeout(() => {
        //         this.close();
        //     }, value.life);
    }

    next() {
        this.index++;
        if(this.index >= this.toastsUI.length) {
            this.index = this.toastsUI.length - 1;
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
        this.toasts.length = 0;
        this.toastsUI = [...this.confirmToasts,...this.toasts];
        this.index = 0;
        this.cdRef.markForCheck();
    }

    public accept(): void {
        const toast = this.confirmToasts.shift();
        const obs = toast?.confirm$;
        if(!!obs) {
            obs.next(true);
            obs.complete();
            this.toastsUI = [...this.confirmToasts,...this.toasts];
            this.previous();
        }
    }

    public reject(): void {
        const toast = this.confirmToasts.shift();
        const obs = toast?.confirm$;
        if(!!obs) {
            obs.next(false);
            obs.complete();
            this.toastsUI = [...this.confirmToasts,...this.toasts];
            this.previous();
        }
    }

    ngOnDestroy(): void {
        this.toastSvc.unsubscribe()
    }
}
