import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { tap } from "rxjs";

/**
 * https://blogs.dropbox.com/developers/2013/07/using-oauth-2-0-with-the-core-api/
 */
@Injectable({ providedIn: 'root' })
export class CloudDropboxService {
    constructor(private http: HttpClient, @Inject('environment') environment: {production:boolean}) {
        if (environment.production) {
            this.redirectUrl = 'https://tv-watchlist.github.io/dropbox-redirect';
        } else {
            this.redirectUrl = 'http://localhost:4200/dropbox-redirect';
        }
        this.appKey = CloudDropboxService.decodeKey('pp!(u:/640pu(!5'); // tied to https://tv-watchlist.github.io
    }
    private appKey = '';
    private redirectUrl = '';

    static captureResponse(location: Location) {
        // https://www.example.com/mycallback#access_token=<access token>&token_type=Bearer&uid=<user ID>&state=<CSRF token>

        if (location.hash) {
            let hash = window.location.hash.substring(1);
            let json = CloudDropboxService.getJsonFromUrl(hash);
            if (localStorage["dropbox_csrf_token"] == json["state"]) {
                for (let key in json) {
                    localStorage["dropbox_" + key] = json[key];
                }
                console.log('Dropbox access granted.');
            } else {
                console.log('CSRF check failed');
            }
        } else {
            console.log('Missing hash parameters');
        }
    }

    get AccountId(): string {
        return localStorage["dropbox_account_id"];
    }

    get AccessToken(): string {
        return localStorage["dropbox_access_token"];
    }

    get CsrfToken(): string {
        return localStorage["dropbox_csrf_token"];
    }

    get IsAuthenticated() {
		return !!this.AccessToken;
	}

    getAuthenticationUrl(): string {
        // https://www.dropbox.com/1/oauth2/authorize?client_id=<app key>&response_type=token&redirect_uri=<redirect URI>&state=<CSRF token>
        localStorage["dropbox_csrf_token"] = this.getGUID();
        return "https://www.dropbox.com/1/oauth2/authorize?client_id=" + this.appKey + "&response_type=token&redirect_uri=" + this.redirectUrl + "&state=" + localStorage["dropbox_csrf_token"];
    }

    clearDropboxToken(): void {
        localStorage.removeItem('dropbox_account_id');
        localStorage.removeItem('dropbox_access_token');
        localStorage.removeItem('dropbox_csrf_token');
        localStorage.removeItem('dropbox_uid');
        localStorage.removeItem('dropbox_token_type');
        localStorage.removeItem('dropbox_state');
        console.log('cleared dropbox tokens');
    }

    getCurrentAccountInfo() {
        const options = {
            headers: {
                'Authorization': 'Bearer ' + this.AccessToken,
            },
        };

        return this.http.post('https://api.dropboxapi.com/2/users/get_current_account', undefined, options);
    }

    getMetadata() {
        const options = {
            headers: {
                'Authorization': 'Bearer ' + this.AccessToken,
                'Content-Type': 'application/json',
            },
        };

        const content = {
            "path": "/tv-watchlist-db-v6.txt",
            "include_media_info": false,
            "include_deleted": false,
            "include_has_explicit_shared_members": false
        }
        return this.http.post('https://api.dropboxapi.com/2/files/get_metadata', content, options);
    }

    upload(content: string) {
        // const body = new HttpParams()
        //     .set('param1', 'value1')
        //     .set('param1', 'value1')
        // body.toString()

        const options = {
            headers: {
                'Authorization': 'Bearer ' + this.AccessToken,
                'Dropbox-API-Arg': JSON.stringify({
                    "path": "/tv-watchlist-db-v6.txt",
                    "mode": "overwrite",
                    "autorename": true,
                    "mute": false
                }),
                'Content-Type': 'application/octet-stream',
            },
        };

        return this.http.post('https://content.dropboxapi.com/2/files/upload', content, options);
    }

    download() {
        const options = {
            headers: {
                'Authorization': 'Bearer ' + this.AccessToken,
                'Dropbox-API-Arg': JSON.stringify({
                    "path": "/tv-watchlist-db-v6.txt"
                }),
            },
        };
        return this.http.post('https://content.dropboxapi.com/2/files/download', undefined, options)
    }

    revokeToken() {
        const options = {
            headers: {
                'Authorization': 'Bearer ' + this.AccessToken,
            },
        };

        return this.http.post('https://api.dropboxapi.com/2/auth/token/revoke', undefined, options).pipe(
            tap(() => {
                this.clearDropboxToken();
            })
        )
    }

    private getGUID() {
        //https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    //https://stackoverflow.com/questions/8486099/how-do-i-parse-a-url-query-parameters-in-javascript
    private static getJsonFromUrl(query: string) {
        const result: { [key: string]: string } = {};
        query.split("&").forEach(function (part) {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    }

    private static decodeKey(a: string) {
		let b = "";
		const c = 66;
		for (var i = 0; i < a.length; i++) {
			b += String.fromCharCode(c ^ a.charCodeAt(i));
		}
		return b;
	}
}

