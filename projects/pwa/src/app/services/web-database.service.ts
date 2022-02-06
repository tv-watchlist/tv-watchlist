import { calcPossibleSecurityContexts } from '@angular/compiler/src/template_parser/binding_parser';
import { Injectable } from '@angular/core';
// https://github.com/jakearchibald/idb#typescript
import { IDBPDatabase, IDBPTransaction, openDB, unwrap } from 'idb';
import { IMyTvQDBv1 } from './db.model';

@Injectable({ providedIn: 'root' })
export class WebDatabaseService {
    private dbPromise!: Promise<IDBPDatabase<IMyTvQDBv1>>;
    constructor() {
        // check for support
        if (!('indexedDB' in window)) {
            console.log('This browser doesn\'t support IndexedDB');
            return;
        }

        this.createDb();
    }

    /*
ERROR Error: Uncaught (in promise): InvalidStateError: Failed to execute 'createObjectStore' on 'IDBDatabase': The database is not running a version change transaction.
Error: Failed to execute 'createObjectStore' on 'IDBDatabase': The database is not running a version change transaction
    */

    private async createDb(name = 'myTvQDB', version = 1): Promise<void> {
        this.dbPromise = openDB<IMyTvQDBv1>(name, version, {
            async upgrade(db: IDBPDatabase<IMyTvQDBv1>, oldVersion: number, newVersion: number | null,
                          transaction: IDBPTransaction<IMyTvQDBv1, ("settings" | "shows" | "episodes")[], "versionchange">): Promise<void> {
                if (oldVersion < 1) {
                    // first create all Object Stores
                    db.createObjectStore('settings');
                    const showStore = db.createObjectStore('shows', {
                        keyPath: 'showId',
                    });
                    showStore.createIndex('nextUpdateTimeIndex', 'nextUpdateTime', {unique: false});

                    const episodeStore = db.createObjectStore('episodes', {
                        keyPath: 'episodeId',
                    });
                    episodeStore.createIndex('showIdIndex', 'showId', {unique: false});
                    episodeStore.createIndex('localShowtimeIndex', 'localShowTime', {unique: false});

                    // and then initialize data
                    const settings: {[key: string]: any} = {
                        updateTime: (new Date()).getTime(),
                        showsOrder: 'airdate',
                        version: 5,
                        defaultEpisodes: 'bookmarked',
                        hideTba: true,
                        hideSeen: true,
                        defaultCountry: 'US'
                    };

                    const promises = [];
                    for (const key in settings) {
                        if (Object.prototype.hasOwnProperty.call(settings, key)) {
                            promises.push(transaction.objectStore('settings').put(settings[key] as any, key));
                        }
                    }
                    promises.push(transaction.done);
                    await Promise.all(promises);
                    promises.length = 0;
                    console.log('IndexedDB v1 created!');
                }
            },
            blocked(): void {
                console.warn('blocked Called if there are older versions of the database open on the origin, so this version cannot open.');
            },
            blocking(): void {
                console.warn('blocking Called if this connection is blocking a future version of the database from opening.');
            },
            terminated(): void {
                console.warn('terminated Called if the browser abnormally terminates the connection. This is not called when db.close() is called.');
            }
        });
    }

    public async getAllAsArray<T>(storeNames: 'settings' | 'shows' | 'episodes'): Promise<T[]>{
        const store = (await this.dbPromise).transaction(storeNames, 'readonly');
        const result = await store.objectStore(storeNames).getAll();
        return result as T[];
    }

    public async getAllAsObject<T>(storeNames: 'settings' | 'shows' | 'episodes'): Promise<T> {
        const store = (await this.dbPromise).transaction(storeNames, 'readonly');
        const result: {[key: string]: any} = {};
        const cursor = store.objectStore(storeNames).openCursor();
        let cursorValue = (await cursor);
        while (true) {
            if (!!cursorValue) {
                result[cursorValue.key] = cursorValue.value;
                cursorValue = await cursorValue.continue();
            }
            if (!cursorValue) { break; }
        }

        return result as T;
    }

    public async clearStore(storeName: "settings" | "shows" | "episodes"): Promise<boolean> {
        const db = (await this.dbPromise);
        return new Promise((resolve, reject) => {
            if(db && db.objectStoreNames.contains(storeName)) {
                const clearTransaction = db.transaction([storeName], 'readwrite');
                clearTransaction.objectStore(storeName).clear().then(() => {
                    resolve(true);
                }).catch(err => {
                    console.error(err);
                    resolve(false);
                })
            }
            resolve(false);
        });
    }

    public async clearAllStores(skipStores: string[] = []): Promise<number> {
        const storeNames = (await this.dbPromise).objectStoreNames;
        console.log(storeNames);
        const len = storeNames.length - skipStores.length;
        let count = 0;
        return new Promise((resolve, reject) => {
            for (const name of storeNames) {
                if (skipStores.indexOf(name) !== -1) { // ["listings","schedules"]
                    continue;
                }
                this.clearStore(name).then(() => {
                    count++;
                    if(len == count){
                        resolve(count);
                    }
                })
            }
            if(len == 0) {
                resolve(0);
            }
        });
    }

    public async putObj(storeName: "settings" | "shows" | "episodes", obj: any, key?: string | IDBKeyRange | undefined): Promise<boolean> {
        const db = (await this.dbPromise);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            store.put(obj, key).then(() => {
                resolve(true);
            }).catch(err => {
                console.error(err);
                resolve(false);
            })
        });
    }

    public async putKeyValueBulk(storeName: "settings" | "shows" | "episodes", obj: {[key: string]: any}): Promise<boolean> {
        const db = (await this.dbPromise);
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const promises = [];
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                promises.push(transaction.objectStore(storeName).put(obj[key] as any, key));
            }
        }
        promises.push(transaction.done);
        return Promise.all(promises).then(() => {
            return true;
        });
    }

    /**
     *
     * @param storeName
     * @param list
     * @param progress
     * @returns
     */
    public async putList(storeName: "settings" | "shows" | "episodes", list: any[], progress?: (counter:number, length:number, isComplete: boolean) => void) {
        const db = (await this.dbPromise);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([storeName], 'readwrite');
            let count = 0;
            transaction.oncomplete = (event) => {
                console.log(storeName+' Added ' + count + '/' + list.length);
                if (!!progress) {
                    progress(count, list.length, true);
                }
                resolve(true);
            }

            transaction.onabort = (event) => {
                if (!!progress) {
                    progress(count, list.length, true);
                }
                resolve(true);
            }

            if (list.length == 0) {
                transaction.abort();
                return;
            }
            const store = unwrap(transaction.objectStore(storeName)); // unwrapping to use onsuccess
            const putNext = () => {
                if (count < list.length) {
                    store.put(list[count]).onsuccess = putNext;
                    ++count;
                    if (!!progress) {
                        progress(count, list.length, false); // called multiple times, false means not complete
                    }
                } else {
                    console.log('populate complete'); // complete
                }
            };
            putNext();
        });
    }
}

/*

*/
