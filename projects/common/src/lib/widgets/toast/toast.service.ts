import { Observable, Observer, Subject } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
let counter = 0;
export class ToastModel {
    type: 'success' | 'info' | 'warn' | 'error';
    message: string;
    life: number;
    confirm$?: Observer<boolean>;
    id: number;
    constructor() {
        this.id = ++counter;
        this.type = 'info';
        this.message = '';
        this.life = 5000; // 5 sec
    }

    /**
     *
     * @param message
     * @param type default info
     * @param life default 5 seconds
     * @returns
     */
    public static Create(message: string, type: 'success' | 'info' | 'warn' | 'error' = 'info', life: number = 5000, confirm$?: Observer<boolean>): ToastModel {
        const retVal = new ToastModel();
        retVal.type = type;
        retVal.message = message;
        retVal.life = life;
        retVal.confirm$ = confirm$;
        return retVal;
    }
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private subject: Subject<ToastModel>;

    constructor() {
        this.subject = new Subject<ToastModel>();
    }

    public message(type: 'success' | 'info' | 'warn' | 'error', message: string, life: number = 5000) {
        const notify = ToastModel.Create(message, type, life);
        this.subject.next(notify);
    }

    public info(message: string, life: number=5000) {
        this.message('info', message, life);
    }

    public success(message: string, life: number=5000) {
        this.message('success', message, life);
    }

    public warning(message: string, life: number = 5000) {
        this.message('warn', message, life);
    }

    public error(message: string, life: number = 5000) {
        this.message('error', message, life);
    }

    public confirm(question: string) {
        return new Observable<boolean>((obs) => {
            const notify = ToastModel.Create(question, 'info', undefined,obs);
            this.subject.next(notify);
            return () => {
            };
        });
    }

    subscribe(next?: (value: ToastModel) => void, error?: (err:any)=>void) {
        return this.subject.subscribe({next, error});
    }

    unsubscribe(): void {
        this.subject.unsubscribe();
    }
}
