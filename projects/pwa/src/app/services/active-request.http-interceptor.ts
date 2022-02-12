import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable()
export class ActiveRequestHttpInterceptor implements HttpInterceptor {
    constructor(private scv: ActiveRequestService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        this.scv.updateRequestCount(true);

        return next.handle(req)
            .pipe(
                finalize(() => {
                    this.scv.updateRequestCount(false);
                }));
    }
}

@Injectable({ providedIn: 'root' })
export class ActiveRequestService {
    constructor() {
        this.subject = new Subject<number>();
        this.count = 0;
    }

    private subject: Subject<number>;
    private count: number;

    updateRequestCount(isActive: boolean){
        this.subject.next(isActive ? ++this.count : --this.count);
    }

    subscribe(next?: (value: number) => void, error?: (err:any)=>void) {
        return this.subject.subscribe({next, error});
    }

    unsubscribe(): void {
        this.subject.unsubscribe();
    }
}
