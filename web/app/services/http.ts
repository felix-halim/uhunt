import {Http, URLSearchParams}  from 'angular2/http';
import {Injectable}             from 'angular2/core';

@Injectable()
export class HttpService {

  constructor(private _http: Http) {}

  get(uri: string, params?: {[prop: string]: string}): Promise<any> {
    return new Promise<any>((resolve) =>
      this.load('get', uri, this.parse(params), resolve));
  }

  post(uri: string, params?: { [prop: string]: string }): Promise<any> {
    return new Promise<any>((resolve) =>
      this.load('post', uri, this.parse(params), resolve));
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

  private load(method, uri, params, resolve) {
    this._http[method](uri, { search: params })
      .map(res => res.json())
      .subscribe(
        res => resolve(res),
        error => setTimeout(() =>
          this.load(method, uri, params, resolve), 1000));
  }
}
