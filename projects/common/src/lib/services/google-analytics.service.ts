import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

declare let gtag: Function;

@Injectable({ providedIn: 'root' })
export class GoogleAnalyticsService {
    constructor(private router: Router) { }

    public init() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                gtag('config', 'UA-28414519-1',
                    {
                        'page_path': event.urlAfterRedirects
                    });
            }
        });
    }

    public trackSeen(showName: string, episodeName: string) {
        this.eventEmitter('Seen', showName, episodeName);
    }

    public trackSearch(term: string) {
        this.eventEmitter('Search', 'Show', term, 'search');
    }

    public trackShowAdd(showName: string, label: 'search'|'popular') {
        this.eventEmitter('Add', 'Show', showName, label);
    }

    public trackShowRemove(showName: string) {
        this.eventEmitter('Remove', 'Show', showName);
    }

    private eventEmitter(
        eventName: string,
        eventCategory: string,
        eventAction: string,
        eventLabel: string | null = null,
        eventValue: number | null = null) {
        gtag('event', eventName, {
            eventCategory: eventCategory,
            eventLabel: eventLabel,
            eventAction: eventAction,
            eventValue: eventValue
        });
    }
}
