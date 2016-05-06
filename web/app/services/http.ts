import {Http, URLSearchParams}  from '@angular/http';
import {Injectable}             from '@angular/core';

@Injectable()
export class HttpService {

  constructor(private _http: Http) {}

  get(uri: string, params?: {[prop: string]: string}): Promise<any> {
    return new Promise<any>((resolve) =>
      this.load_json('get', uri, this.parse(params), resolve));
  }

  post(uri: string, params?: { [prop: string]: string }): Promise<any> {
    return new Promise<any>((resolve) =>
      this.load_json('post', uri, this.parse(params), resolve));
  }

  post_text(uri: string, params?: { [prop: string]: string }): Promise<any> {
    return new Promise<any>((resolve) =>
      this.load_text('post', uri, this.parse(params), resolve));
  }

  private parse(params?: { [prop: string]: string }) {
    var p = new URLSearchParams();
    if (params) {
      for (let key in params) {
        p.set(key, params[key]);
      }
    }
    return p;
  }

  private load_json(method, uri, params, resolve) {
    let resolved = false;
    this._http[method](uri, { search: params }).subscribe(
      res => {
        try {
          resolve(res.json());
          resolved = true;
        } catch (e) {
          console.error("Failed jsoning", res, resolved);
        }
      },
      error => setTimeout(() => {
        console.error("HTTP Error", error);
        this.load_json(method, uri, params, resolve);
      }, 1000),
      () => {
        if (!resolved) {
          console.error("Not resolved but completed");
          this.load_json(method, uri, params, resolve);
        }
      });
  }

  private load_text(method, uri, params, resolve) {
    this._http[method](uri, { search: params })
      .subscribe(res => resolve(res), error => setTimeout(() =>
        this.load_text(method, uri, params, resolve), 1000));
  }
}
