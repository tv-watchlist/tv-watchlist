import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class LoaderScreenService {
    constructor() {
       this.subject = new Subject<{message: string; status: boolean}>();
    }
    private subject: Subject<{message: string; status: boolean}>;

    public show(message:string=''): void {
        this.subject.next({message, status:true});
    }

    public close(): void {
        this.subject.next({message:'', status:false});
    }

    subscribe(next?: (value: {message: string; status: boolean}) => void, error?: (err:any)=>void) {
        return this.subject.subscribe({next, error});
    }

    unsubscribe() {
        this.subject.unsubscribe();
    }
}
