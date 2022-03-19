import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { ActiveRequestService } from './active-request.service';

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
