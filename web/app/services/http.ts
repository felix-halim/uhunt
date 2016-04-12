import {Http}       from 'angular2/http';
import {Injectable} from 'angular2/core';

@Injectable()
export class HttpService {

  constructor(private _http: Http) {}

  get(uri: string): Promise<any> {
    return new Promise<any>((resolve) => this.load('get', uri, resolve));
  }

  post(uri: string): Promise<any> {
    return new Promise<any>((resolve) => this.load('post', uri, resolve));
  }

  private load(method, uri, resolve) {
    this._http[method](uri)
      .map(res => res.json())
      .subscribe(
        res => resolve(res),
        error => setTimeout(() => this.load(method, uri, resolve), 1000));
  }
}
