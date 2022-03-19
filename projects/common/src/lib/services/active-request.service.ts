
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ActiveRequestService {
    constructor() {
        this.subject = new Subject<number>();
        this.count = 0;
    }

    private subject: Subject<number>;
    private count: number;

    updateRequestCount(isActive: boolean){
        let count = isActive ? ++this.count : --this.count;
        if(count < 0) {
            count = 0;
            this.count = 0;
        }
        this.subject.next(count);
    }

    subscribe(next?: (value: number) => void, error?: (err:any)=>void) {
        return this.subject.subscribe({next, error});
    }

    unsubscribe(): void {
        this.subject.unsubscribe();
    }
}
