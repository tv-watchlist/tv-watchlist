import { Injectable } from "@angular/core";
import { BehaviorSubject, Observer } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class OnlineService {
    private isOnline$ = new BehaviorSubject<boolean>(window.navigator.onLine);

    constructor() {
        this.listenToOnlineStatus();
    }

    listenToOnlineStatus(): void {
        window.addEventListener('online', () => this.isOnline$.next(true));
        window.addEventListener('offline', () => this.isOnline$.next(false));
    }

    public subscribe(observer?: Partial<Observer<boolean>> | undefined) {
        return this.isOnline$.subscribe(observer);
    }
}
