import {Injectable}       from 'angular2/core';

import {Config}           from '../config';

import {DatabaseService}  from './database';
import {HttpService}      from './http';

@Injectable()
export class UDebugService {
  problem_by_number: {[prop: number]: boolean} = {}; // index by problem number.

  constructor(
      private _databaseService: DatabaseService,
      private _httpService: HttpService) {

    var problems = this._databaseService.get('uhunt_udebug');
    if (problems) {
      console.log('Loading uDebug from localStorage ...');
      this.parse(problems);
    }

    this.schedule_sync();
  }

  exists(num: number):boolean {
    return this.problem_by_number.hasOwnProperty(num);
  }

  private schedule_sync() {
    var staleness = Config.now -
      (this._databaseService.get('last_udebug_reload') || 0);

    setTimeout(() => this.sync(),
      Math.max(1, (Config.MAX_PROBLEMS_STALENESS_SECONDS - staleness) * 1000));
  }

  private sync() {
    console.log('Syncing uDebug problems ...');
    this._httpService.get('https://www.udebug.com/api/UVa').then(arr => {
      this.parse(arr);
      this._databaseService.set('uhunt_udebug', arr);
      this._databaseService.set('last_udebug_reload', Config.now);
      this.schedule_sync();
    });
  }

  // Parse raw data from the API and update this wrapper.
  private parse(arr) {
    for (let num of arr) {
      this.problem_by_number[num] = true;
    }
  }
}
