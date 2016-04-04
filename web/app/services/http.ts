import {Http}       from 'angular2/http';
import {Injectable} from 'angular2/core';

@Injectable()
export class HttpService {

  constructor(private _http: Http) {}

  get(uri: string): Promise<any> {
    return new Promise<any>((resolve) => this.load(uri, resolve));
  }

  private load(uri, resolve) {
    this._http.get(uri)
      .map(res => res.json())
      .subscribe(
        res => resolve(res),
        error => setTimeout(() => this.load(uri, resolve), 1000));
  }
}
