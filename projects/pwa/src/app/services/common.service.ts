import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class CommonService {
    constructor() {
        this.now = new Date().getTime();
    }
    private now: number;

    get time(): number {
        return this.now;
    }

    clearObj(object: any): void {
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                delete object[key];
            }
        }
    }

    getKeys(obj: any): string[] {
        if (obj) {
            return Object.keys(obj);
        }
        else {
            return [];
        }
    }

    zeroPad(num: number, places: number): string {
        if (!num) { num = 0; }
        return Array(Math.max(places - String(num).length + 1, 0)).join('0') + num;
    }

    sortFunction(x: any, y: any): number {
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }

    getDaysBetween(first: Date, second: Date): number {
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const millisBetween = second.getTime() - first.getTime();
        const days = Math.abs(millisBetween / millisecondsPerDay);
        // console.log('first:' + first.toString() + ' second:' + second.toString() + ' daysBetween:' + days);
        return +days.toFixed(4);
    }

    getDaysBetweenToEnglish(first: Date, second: Date): string {
        if (!first || !second) {
            return '';
        }

        const days = this.getDaysBetween(
            new Date(first.getFullYear(), first.getMonth(), first.getDate()),
            new Date(second.getFullYear(), second.getMonth(), second.getDate()));

        if (+(days / 365).toFixed(2) > 2) {
            return 'TBA';
        }
        if (days < 1) {
            return 'Today';
        } else if (days < 2) {
            return 'Tomorrow';
        } else if (days < 30) {
            return days + ' Day(s)';
        } else if (days < 90) {
            return (days / 7).toFixed(0) + ' Week(s)';
        } else if (days < 365) {
            return (days / 30).toFixed(0) + ' Month(s)';
        } else {
            return (days / 365).toFixed(2) + ' Year(s)';
        }
    }
}
