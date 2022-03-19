import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable, Injector, isDevMode } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class TvQAngularErrorsHandler implements ErrorHandler {
    constructor(
        // ErrorHandler is created before the providers, use the Injector to get other services.
        private injector: Injector,
    ) { }

    handleError(error: Error | HttpErrorResponse) {
        if (error instanceof HttpErrorResponse) {
            this.httpError(error);
        } else {
            this.jsError(error);
        }
    }

    httpError(response: HttpErrorResponse) {
        console.group('httpError');
        console.error(response, navigator); // eslint-disable-line

        const svc = this.injector.get(ErrorService);

        if (!navigator.onLine || response.status === 0) {
            // Handle offline error
            svc.error('Server not reachable, Please check your internet.');
        } else {
            let message = '';
            try {
                message = response.message || response.error;
            } catch (er) {
                message = response.statusText;
                console.error('catch error', er);
            }

            if (response.status >= 400 && response.status < 500) {
                svc.warning(message, response.url ||'');
            } else {
                svc.error(message, response.url ||'');
            }
        }
        console.groupEnd();
    }

    jsError(error: Error) {
        console.group('jsError');
        console.error(error); // eslint-disable-line
        console.groupEnd();

        const svc = this.injector.get(ErrorService);
        svc.error(error.message, error.stack, error.name);

        if (isDevMode()) {
            throw error;
        }
    }
}

export class ErrorModel {
    type: 'warn' | 'error';
    message: string;
    name?: string;
    stack?: string;

    constructor() {
        this.type = 'error';
        this.message = '';
        this.name = '';
        this.stack = '';
    }

    /**
     *
     * @param message
     * @param type default error
     * @returns
     */
    public static Create(message: string, type: 'warn' | 'error' = 'error', stack?:string, name?:string): ErrorModel {
        const retVal = new ErrorModel();
        retVal.type = type;
        retVal.message = message;
        retVal.stack = stack;
        retVal.name = name;
        return retVal;
    }
}

@Injectable({ providedIn: 'root' })
export class ErrorService {
    private subject: Subject<ErrorModel>;

    constructor() {
        this.subject = new Subject<ErrorModel>();
    }

    public message(type: 'warn' | 'error', message: string, stack?: string, name?: string) {
        const notify = ErrorModel.Create(message, type, stack, name);
        this.subject.next(notify);
    }

    public warning(message: string, stack?: string, name?: string) {
        this.message('warn', message, stack, name);
    }

    public error(message: string, stack?: string, name?: string) {
        this.message('error', message, stack, name);
    }

    subscribe(next?: (value: ErrorModel) => void, error?: (err:any)=>void) {
        return this.subject.subscribe({next, error});
    }

    unsubscribe(): void {
        this.subject.unsubscribe();
    }
}
