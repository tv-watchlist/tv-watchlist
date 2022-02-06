import { calcPossibleSecurityContexts } from '@angular/compiler/src/template_parser/binding_parser';
import { Injectable } from '@angular/core';
// https://github.com/jakearchibald/idb#typescript
// examples https://hackernoon.com/use-indexeddb-with-idb-a-1kb-library-that-makes-it-easy-8p1f3yqq
import { IDBPDatabase, IDBPTransaction, IndexKey, IndexNames, openDB, unwrap } from 'idb';
import { IMyTvQDbSetting, IMyTvQDBv1, MyTvQStoreName } from './db.model';

@Injectable({ providedIn: 'root' })
export class WebDatabaseService {
    private dbPromise!: Promise<IDBPDatabase<IMyTvQDBv1>>;
    constructor() {
        // check for support
        if (!('indexedDB' in window)) {
            console.log('This browser doesn\'t support IndexedDB');
            return;
        }

        this.createDb()
    }

    private async createDb(name = 'myTvQDB', version = 1): Promise<void> {
        this.dbPromise = openDB<IMyTvQDBv1>(name, version, {
            async upgrade(db: IDBPDatabase<IMyTvQDBv1>, oldVersion: number, newVersion: number | null,
                transaction: IDBPTransaction<IMyTvQDBv1, (MyTvQStoreName)[], "versionchange">) {
                async function upgradeMyTvQDBfromV0toV1() {
                    // first create all Object Stores
                    db.createObjectStore('settings');
                    const showStore = db.createObjectStore('shows', {
                        keyPath: 'showId',
                    });
                    showStore.createIndex('nextUpdateTimeIndex', 'nextUpdateTime', { unique: false });

                    const episodeStore = db.createObjectStore('episodes', {
                        keyPath: 'episodeId',
                    });
                    episodeStore.createIndex('showIdIndex', 'showId', { unique: false });
                    episodeStore.createIndex('localShowtimeIndex', 'localShowTime', { unique: false });

                    // and then initialize data
                    const settings: IMyTvQDbSetting = {
                        updateTime: (new Date()).getTime(),
                        showsOrder: 'airdate',
                        version: 5,
                        defaultEpisodes: 'bookmarked',
                        hideTba: true,
                        hideSeen: true,
                        defaultCountry: 'US',
                        showIdOrderList: [],
                        timezoneOffset: {'US': 0}
                    };

                    const promises = [];
                    for (const key in settings) {
                        if (Object.prototype.hasOwnProperty.call(settings, key)) {
                            promises.push(transaction.objectStore('settings').put(settings[key as keyof IMyTvQDbSetting], key));
                        }
                    }
                    promises.push(transaction.done);
                    await Promise.all(promises);
                    promises.length = 0;
                    console.log('IndexedDB v1 created!');
                }
                async function upgradeMyTvQDBfromV1toV2() {
                    console.log('IndexedDB v2 stub. To be implemented when need upgrading');
                }
                switch (oldVersion) {
                    case 0:
                        upgradeMyTvQDBfromV0toV1();
                        break;
                    //     /* falls through */
                    // case 1:
                    //     upgradeMyTvQDBfromV1toV2();
                    //     break;
                    default:
                        console.error('unknown db version');
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

    public getKeyRange(operator: "=" | "<" | "<=" | ">" | ">=" | "> && <" | ">= && <=" | "> && <=" | ">= && <", lower: string, upper?: string): IDBKeyRange {
        switch (operator) {
            case "=":
                return IDBKeyRange.only(lower);
            case "<":
                return IDBKeyRange.upperBound(lower, true);
            case "<=":
                return IDBKeyRange.upperBound(lower);
            case ">":
                return IDBKeyRange.lowerBound(lower, true);
            case ">=":
                return IDBKeyRange.lowerBound(lower);
            case "> && <":
                return IDBKeyRange.bound(lower, upper, true, true);
            case ">= && <=":
                //IDBKeyRange.bound(searchTerm, searchTerm + '\uffff') It'd be better to use \uffff as your dagger rather than z. You won't get search results like "wikip�dia" when searching for "wiki" if you use z...
                return IDBKeyRange.bound(lower, upper);
            case "> && <=":
                return IDBKeyRange.bound(lower, upper, true, false);
            case ">= && <":
                return IDBKeyRange.bound(lower, upper, false, true);
        }
    }

    public async getObj<T>(storeName: MyTvQStoreName, key: string | IDBKeyRange): Promise<T> {
        const transaction = (await this.dbPromise).transaction(storeName, 'readonly');
        return await transaction.objectStore(storeName).get(key) as T;
    }

    public async getList<T>(storeName: MyTvQStoreName, keyList: string[], progress?: (counter: number, length: number, isComplete: boolean) => void):Promise<T[]> {
        const db = (await this.dbPromise);
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            let count = 0;
            const result:T[] = [];
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
                    if(!!request) {
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

    public async getIndexedList<T extends MyTvQStoreName>(storeName: T, indexName: IndexNames<IMyTvQDBv1, T>, range: IDBKeyRange, direction?: IDBCursorDirection | undefined) {
        const transaction = (await this.dbPromise).transaction(storeName, "readonly");
        const index = transaction.store.index(indexName);
        let cursorRequest = await index.openCursor(range, direction);
        const result: T[] = [];
        while (true) {
            if(!!cursorRequest) {
                result.push(cursorRequest.value);
                cursorRequest = await cursorRequest.continue();
            } else {
                break;
            }
        }
    }

    public async deleteObj(storeName: MyTvQStoreName, key: string | IDBKeyRange) {
        const transaction = (await this.dbPromise).transaction(storeName, "readwrite");
        return transaction.objectStore(storeName).delete(key);
    }

    public async deleteRange<T extends MyTvQStoreName>(storeName: T, indexName: IndexNames<IMyTvQDBv1, T>, range: IDBKeyRange ) {
        const transaction = (await this.dbPromise).transaction(storeName, "readwrite");
        const index = transaction.store.index(indexName);
        let cursorRequest = await index.openCursor(range);
        while (true) {
            if(!!cursorRequest) {
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
        const db = (await this.dbPromise);
        const transaction = db.transaction(storeName, 'readwrite');
        return await transaction.objectStore(storeName).put(obj, key).then(()=>true);
    }

    public async putKeyValueBulk(storeName: MyTvQStoreName, obj: { [key: string]: any }): Promise<boolean> {
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
        return Promise.all(promises).then(() =>  true);
    }

    /**
     *
     * @param storeName
     * @param list
     * @param progress
     * @returns
     */
    public async putList(storeName: MyTvQStoreName, list: any[], progress?: (counter: number, length: number, isComplete: boolean) => void) {
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
