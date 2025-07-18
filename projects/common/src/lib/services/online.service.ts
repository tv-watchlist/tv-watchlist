import { Inject, Injectable } from "@angular/core";
import { BehaviorSubject, Observer } from "rxjs";
import { WINDOW } from "./window.service";

@Injectable({
    providedIn: 'root'
})
export class OnlineService {
    private isOnline$:BehaviorSubject<boolean>;

    constructor(@Inject(WINDOW) private window: Window) {
        this.isOnline$ = new BehaviorSubject<boolean>(this.window.navigator.onLine);
        this.listenToOnlineStatus();
    }

    listenToOnlineStatus(): void {
        this.window.addEventListener('online', () => this.isOnline$.next(true));
        this.window.addEventListener('offline', () => this.isOnline$.next(false));
    }

    public subscribe(observer?: Partial<Observer<boolean>> | undefined) {
        return this.isOnline$.subscribe(observer);
    }
}
