import { InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('Global window object', {
  factory: () =>
    {
        if (typeof window !== 'undefined') {
            return window;
        }
        // Return a mock object or throw an error if window access is critical on the server
        return { location: {}, indexedDB:{} } as Window;
    }
});

export const NAVIGATOR = new InjectionToken<Navigator>('Global Navigator object', {
  factory: () =>
    {
        if (typeof navigator !== 'undefined') {
            return navigator;
        }
        // Return a mock object or throw an error if navigator access is critical on the server
        return { /* minimal mock object for server-side if needed */ } as Navigator;
    }
});
