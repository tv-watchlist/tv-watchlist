import { Injectable } from '@angular/core';

export type sortArg<T> = keyof T | `-${string & keyof T}`

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

    getDaysBetween(past: Date, future: Date): number {
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const millisBetween = future.getTime() - past.getTime();
        const days = millisBetween / millisecondsPerDay;
        return +days.toFixed(4);
    }

    getDaysBetweenToEnglish(past: Date, future: Date): string {
        if (!past || !future) {
            return '';
        }

        let days = this.getDaysBetween(
            new Date(past.getFullYear(), past.getMonth(), past.getDate()),
            new Date(future.getFullYear(), future.getMonth(), future.getDate()));

        let isNegative = false;
        if(days < 0) {
            isNegative = true;
            days = Math.abs(days);
        }

        if (+(days / 365).toFixed(2) > 2) {
            return 'TBA';
        }
        if (days < 1) {
            return 'Today';
        } else if (days < 2) {
            return  !isNegative ? 'Tomorrow' : 'Yesterday';
        } else if (days < 30) {
            return (!isNegative ? 1 : -1) * days + ' Day(s)';
        } else if (days < 90) {
            return  ((!isNegative ? 1 : -1) * (days / 7)).toFixed(0)  + ' Week(s)';
        } else if (days < 365) {
            return ((!isNegative ? 1 : -1) * (days / 30)).toFixed(0) + ' Month(s)';
        } else {
            return ((!isNegative ? 1 : -1) * (days / 365.25)).toFixed(2) + ' Year(s)';
        }
    }

    sortAscending(x: any, y: any): number {
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }

    // https://stackoverflow.com/questions/68278850/how-to-extend-a-keyof-type-so-that-it-includes-modified-versions-of-the-keys-e/68279093#68279093
    /**
     * Returns a comparator for objects of type T that can be used by sort
     * functions, were T objects are compared by the specified T properties.
     *
     * @param sortBy - the names of the properties to sort by, in precedence order.
     *                 Prefix any name with `-` to sort it in descending order.
     */
    byPropertiesOf<T extends object> (sortBy: Array<sortArg<T>>) {
        function compareByProperty (arg: sortArg<T>) {
            let key: keyof T
            let sortOrder = 1
            if (typeof arg === 'string' && arg.startsWith('-')) {
                sortOrder = -1
                // Typescript is not yet smart enough to infer that substring is keyof T
                key = arg.substr(1) as keyof T
            } else {
                // Likewise it is not yet smart enough to infer that arg is not keyof T
                key = arg as keyof T
            }
            return function (a: T, b: T) {
                const result = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0

                return result * sortOrder
            }
        }

        return function (obj1: T, obj2: T) {
            let i = 0
            let result = 0
            const numberOfProperties = sortBy?.length
            while (result === 0 && i < numberOfProperties) {
                result = compareByProperty(sortBy[i])(obj1, obj2)
                i++
            }

            return result
        }
    }

    /**
     * Sorts an array of T by the specified properties of T.
     *
     * @param arr - the array to be sorted, all of the same type T
     * @param sortBy - the names of the properties to sort by, in precedence order.
     *                 Prefix any name with `-` to sort it in descending order.
     */
    sort<T extends object> (arr: T[], ...sortBy: Array<sortArg<T>>) {
        arr.sort(this.byPropertiesOf<T>(sortBy))
    }
}

