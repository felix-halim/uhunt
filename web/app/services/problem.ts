import {Injectable}       from 'angular2/core';

import {Observable}       from 'rxjs/Observable';
import {Observer}         from 'rxjs/Observer';

import {Config}           from '../config';

import {Problem}          from '../models/problem';

import {DatabaseService}  from './database';
import {HttpService}      from './http';

@Injectable()
export class ProblemService {
  ready: Promise<number>;
  private problems$: Observable<number>;
  private observer: Observer<number>;
  private problem_by_id: { [prop: number]: Problem } = {};
  private problem_by_number: { [prop: number]: Problem } = {};

  constructor(
      private _httpService: HttpService,
      private _databaseService: DatabaseService) {

    this.problems$ = new Observable(o => this.observer = o).share();
    this.ready = new Promise<number>((resolve) => {
      this.problems$.subscribe((length) => resolve(length));
    });

    var problems = this._databaseService.get('uhunt_problems');
    if (problems) {
      console.log('Loading problems from localStorage ...');
      this.parse(problems);
      this.observer.next(problems.length);
    }

    this.schedule_sync();
  }

  subscribe(f) {
    this.ready.then(() => this.problems$.subscribe(f));
  }

  private schedule_sync() {
    var staleness = Config.now -
      (this._databaseService.get('uhunt_problems_last_sync') || 0);

    setTimeout(() => this.sync(),
      Math.max(1, (Config.MAX_PROBLEMS_STALENESS_SECONDS - staleness) * 1000));
  }

  private sync() {
    console.log('Syncing problems ...');
    this._httpService.get(Config.API_PATH + '/p').then(problems => {
      this.parse(problems);
      this._databaseService.set('uhunt_problems', problems);
      this._databaseService.set('uhunt_problems_last_sync', Config.now);
      this.observer.next(problems.length);
      this.schedule_sync();
    });
  }

  private parse(problems) {
    this.problem_by_id = {};
    this.problem_by_number = {};
    for (let p of problems) {
      let problem = new Problem(p);
      this.problem_by_id[problem.id] = problem;
      this.problem_by_number[problem.number] = problem;
    }
  }

  getProblemById(id: number): Problem {
    if (this.problem_by_id[id]) {
      return this.problem_by_id[id];
    }
    return Problem.UNKNOWN;
  }

  getProblemByNumber(num: number): Problem {
    if (this.problem_by_number[num]) {
      return this.problem_by_number[num];
    }
    return Problem.UNKNOWN;
  }

  // Loop through all the problems.
  each(f: (p: Problem) => void) {
    for (let problem_id in this.problem_by_id) {
      f(this.problem_by_id[problem_id]);
    }
  }
}
