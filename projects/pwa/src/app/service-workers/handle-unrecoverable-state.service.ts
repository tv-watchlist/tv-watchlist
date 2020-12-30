import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable()
export class HandleUnrecoverableStateService {
  constructor(updates: SwUpdate) {
    updates.unrecoverable.subscribe(event => {
        console.log(`An error occurred that we cannot recover from:\n${event.reason}\n\n` +
            'Please reload the page.');
    //   notifyUser(
    //     `An error occurred that we cannot recover from:\n${event.reason}\n\n` +
    //     'Please reload the page.');
    });
  }
}
