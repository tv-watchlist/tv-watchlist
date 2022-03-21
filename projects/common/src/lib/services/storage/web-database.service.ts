import { Injectable } from '@angular/core';
// https://github.com/jakearchibald/idb#typescript
// examples https://hackernoon.com/use-indexeddb-with-idb-a-1kb-library-that-makes-it-easy-8p1f3yqq
import { IDBPDatabase, IDBPTransaction, IndexNames, openDB, unwrap } from 'idb';
import { IMyTvQDbSetting, IMyTvQDBv2, MyTvQDbSetting, MyTvQStoreName } from './db.model';

@Injectable({ providedIn: 'root' })
export class WebDatabaseService {
    private dbPromise!: Promise<IDBPDatabase<IMyTvQDBv2>>;
    constructor() {
        // check for support
        if (!('indexedDB' in window)) {
            console.warn('This browser doesn\'t support IndexedDB');
            return;
        }

        this.createDb();
        console.log('IndexedDB initialized');
    }

    private async createDb(name = 'myTvQDB', version = 2): Promise<void> {
        this.dbPromise = openDB<IMyTvQDBv2>(name, version, {
            async upgrade(db: IDBPDatabase<IMyTvQDBv2>, oldVersion: number, newVersion: number | null,
                transaction: IDBPTransaction<IMyTvQDBv2, (MyTvQStoreName)[], 'versionchange'>) {
                async function upgradeMyTvQDBfromV0toV1() {
                    // first create all Object Stores
                    db.createObjectStore('settings');
                    const showStore = db.createObjectStore('shows', {
                        keyPath: 'showId',
                    });
                    showStore.createIndex('updateTimeIndex', 'updateTime', { unique: false });

                    const episodeStore = db.createObjectStore('episodes', {
                        keyPath: 'episodeId',
                    });
                    episodeStore.createIndex('showIdIndex', 'showId', { unique: false });
                    episodeStore.createIndex('localShowTimeIndex', 'localShowTime', { unique: false });

                    console.log('IndexedDB v1 created!');
                }
                async function upgradeMyTvQDBfromV1toV2() {
                    const notifyStore = db.createObjectStore('showsNotifications', {
                        keyPath: 'id',
                    });
                    notifyStore.createIndex('showIdIndex', 'showId', { unique: false });
                    notifyStore.createIndex('notifyTimeIndex', 'notifyTime', { unique: false });

                    console.log('IndexedDB v2 created!');
                }
                async function initializeData(version: number) {
                    // and then initialize data
                    const settings: IMyTvQDbSetting = MyTvQDbSetting.default;
                    const promises = [];
                    if (version < 1) {
                        for (const key in settings) {
                            if (Object.prototype.hasOwnProperty.call(settings, key)) {
                                promises.push(transaction.objectStore('settings').put(settings[key as keyof IMyTvQDbSetting], key));
                            }
                        }
                    }

                    if (version < 2) {
                        promises.push(transaction.objectStore('settings').put(MyTvQDbSetting.default.enableNotification, 'enableNotification'));
                        promises.push(transaction.objectStore('settings').put(MyTvQDbSetting.default.notifyBeforeMin, 'notifyBeforeMin'));
                    }
                    promises.push(transaction.done);
                    await Promise.all(promises);
                    promises.length = 0;
                }
                if (oldVersion < 1) {
                    upgradeMyTvQDBfromV0toV1();
                }
                if (oldVersion < 2) {
                    upgradeMyTvQDBfromV1toV2();
                }

                initializeData(oldVersion);
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

    public getKeyRange(operator: '=' | '<' | '<=' | '>' | '>=' | '> && <' | '>= && <=' | '> && <=' | '>= && <', lower: any, upper?: any): IDBKeyRange {
        switch (operator) {
            case '=':
                return IDBKeyRange.only(lower);
            case '<':
                return IDBKeyRange.upperBound(lower, true);
            case '<=':
                return IDBKeyRange.upperBound(lower);
            case '>':
                return IDBKeyRange.lowerBound(lower, true);
            case '>=':
                return IDBKeyRange.lowerBound(lower);
            case '> && <':
                return IDBKeyRange.bound(lower, upper, true, true);
            case '>= && <=':
                //IDBKeyRange.bound(searchTerm, searchTerm + '\uffff') It'd be better to use \uffff as your dagger rather than z. You won't get search results like 'wikip�dia' when searching for 'wiki' if you use z...
                return IDBKeyRange.bound(lower, upper);
            case '> && <=':
                return IDBKeyRange.bound(lower, upper, true, false);
            case '>= && <':
                return IDBKeyRange.bound(lower, upper, false, true);
        }
    }

    public async getObj<T>(storeName: MyTvQStoreName, key: string | IDBKeyRange): Promise<T> {
        const transaction = (await this.dbPromise).transaction(storeName, 'readonly');
        return await transaction.objectStore(storeName).get(key) as T;
    }

    public async getList<T>(storeName: MyTvQStoreName, keyList: string[], progress?: (counter: number, length: number, isComplete: boolean) => void): Promise<T[]> {
        const db = (await this.dbPromise);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            let count = 0;
            const result: T[] = [];
            transaction.oncomplete = (event) => {
                console.log(storeName + ' Added ' + count + '/' + keyList.length);
                if (!!progress) {
                    progress(count, keyList.length, true);
                }
                resolve(result);
            }

            transaction.onabort = (event) => {
                if (!!progress) {
                    progress(count, keyList.length, true);
                }
                resolve(result);
            }

            if (keyList.length == 0) {
                transaction.abort();
                return;
            }
            const store = unwrap(transaction.objectStore(storeName)); // unwrapping to use onsuccess

            const getNext = (ev?: Event) => {
                let request: IDBRequest<any> | undefined;
                if (count < keyList.length) {
                    if (!!request) {
                        result.push(request.result);
                    }
                    request = store.get(keyList[count]);
                    request.onsuccess = getNext;
                    ++count;
                    if (!!progress) {
                        progress(count, keyList.length, false); // called multiple times, false means not complete
                    }
                } else {
                    console.log('populate complete'); // complete
                }
            };
            getNext();
        });
    }

    public async getAllAsArray<T>(storeName: MyTvQStoreName, key?: string | IDBKeyRange | null | undefined, count?: number | undefined): Promise<T[]> {
        const transaction = (await this.dbPromise).transaction(storeName, 'readonly');
        const result = await transaction.objectStore(storeName).getAll(key, count);
        return result as T[];
    }

    public async getAllAsObject<T>(storeName: MyTvQStoreName, key?: string | IDBKeyRange | null | undefined, direction?: IDBCursorDirection | undefined): Promise<T> {
        const store = (await this.dbPromise).transaction(storeName, 'readonly');
        const result: { [key: string]: any } = {};
        let cursorRequest = await store.objectStore(storeName).openCursor(key, direction);
        while (true) {
            if (!!cursorRequest) {
                result[cursorRequest.key] = cursorRequest.value;
                cursorRequest = await cursorRequest.continue();
            }
            if (!cursorRequest) { break; }
        }

        return result as T;
    }

    public async getIndexedList<T extends MyTvQStoreName, U>(storeName: T, indexName: IndexNames<IMyTvQDBv2, T>, range: IDBKeyRange, direction?: IDBCursorDirection | undefined): Promise<U[]> {
        const transaction = (await this.dbPromise).transaction(storeName, 'readonly');
        const index = transaction.store.index(indexName);
        let cursorRequest = await index.openCursor(range, direction);
        const result: U[] = [];
        while (true) {
            if (!!cursorRequest) {
                result.push(cursorRequest.value);
                cursorRequest = await cursorRequest.continue();
            } else {
                break;
            }
        }
        return result;
    }

    public async getIndexedObject<T extends MyTvQStoreName, U>(storeName: T, indexName: IndexNames<IMyTvQDBv2, T>, range: IDBKeyRange, direction?: IDBCursorDirection | undefined) {
        const transaction = (await this.dbPromise).transaction(storeName, 'readonly');
        const index = transaction.store.index(indexName);
        let cursorRequest = await index.openCursor(range, direction);
        const result: { [key: string]: U } = {};
        while (true) {
            if (!!cursorRequest) {
                result[cursorRequest.primaryKey] = cursorRequest.value;
                cursorRequest = await cursorRequest.continue();
            } else {
                break;
            }
        }
        return result;
    }

    public async deleteObj(storeName: MyTvQStoreName, key: string | IDBKeyRange) {
        const transaction = (await this.dbPromise).transaction(storeName, 'readwrite');
        return transaction.objectStore(storeName).delete(key);
    }

    public async deleteRange<T extends MyTvQStoreName>(storeName: T, indexName: IndexNames<IMyTvQDBv2, T>, range: IDBKeyRange) {
        const transaction = (await this.dbPromise).transaction(storeName, 'readwrite');
        const index = transaction.store.index(indexName);
        let cursorRequest = await index.openCursor(range);
        while (true) {
            if (!!cursorRequest) {
                await cursorRequest.delete();
                cursorRequest = await cursorRequest.continue();
            } else {
                break;
            }
        }
    }

    public async clearStore(storeName: MyTvQStoreName): Promise<boolean> {
        const db = (await this.dbPromise);
        return new Promise((resolve, reject) => {
            if (db && db.objectStoreNames.contains(storeName)) {
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

    public async clearAllStores(skipStores: MyTvQStoreName[] = []): Promise<number> {
        const storeNames = (await this.dbPromise).objectStoreNames;
        console.log(storeNames);
        const len = storeNames.length - skipStores.length;
        let count = 0;
        return new Promise((resolve, reject) => {
            for (const name of storeNames) {
                if (skipStores.indexOf(name) !== -1) { // ['listings','schedules']
                    continue;
                }
                this.clearStore(name).then(() => {
                    count++;
                    if (len == count) {
                        resolve(count);
                    }
                })
            }
            if (len == 0) {
                resolve(0);
            }
        });
    }

    public async putObj(storeName: MyTvQStoreName, obj: any, key?: string | IDBKeyRange | undefined): Promise<boolean> {
        if (obj === undefined || obj === null) {
            return false;
        }
        const db = (await this.dbPromise);
        const transaction = db.transaction(storeName, 'readwrite');
        return await transaction.objectStore(storeName).put(obj, key).then(() => true);
    }

    public async putKeyValueBulk(storeName: MyTvQStoreName, obj: { [key: string]: any }): Promise<boolean> {
        if (obj === undefined || obj === null) {
            return false;
        }
        const db = (await this.dbPromise);
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const promises = [];
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                promises.push(transaction.objectStore(storeName).put(obj[key] as any, key));
            }
        }
        promises.push(transaction.done);
        return Promise.all(promises).then(() => true);
    }

    /**
     *
     * @param storeName
     * @param list
     * @param progress
     * @returns
     */
    public async putList(storeName: MyTvQStoreName, list: any[], progress?: (counter: number, length: number, isComplete: boolean) => void) {
        if (list === undefined || list === null || list.length === 0) {
            return;
        }
        const db = (await this.dbPromise);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            let count = 0;
            transaction.oncomplete = (event) => {
                console.log(storeName + ' Added ' + count + '/' + list.length);
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
