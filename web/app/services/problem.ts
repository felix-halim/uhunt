import {Injectable}    from 'angular2/core';

import {Config}        from '../config';

import {Problem}       from '../models/problem';

import {HttpService}   from './http';

interface HashMapOfProblems {
  [key: number]: Problem;
}

@Injectable()
export class ProblemService {
  problem_by_id: HashMapOfProblems = {};
  problem_by_number: HashMapOfProblems = {};
  ready: Promise<number>;
  refreshing: boolean;

  constructor(private _httpService: HttpService) {
    this.ready = this.loadProblems();

    /*
    // Update problem statistics once a day.
    var last_problem_reload = Config.now - uhunt_db.get('last_problem_reload');
    if (last_problem_reload < 0 || last_problem_reload > 24 * 60 * 60 * (1 + Math.random() * 0)) reload();

    // Try initialize the problems from cache if exists.
    var problem_json = uhunt_db.get('probs');
    if (problem_json) {
      console.log('load problems from db');
      parse(problem_json);
    }
    */
  }

  getProblem(id: number): Problem {
    if (!this.problem_by_id[id]) {
      this.ready = this.loadProblems();
      return Problem.UNKNOWN;
    }
    return this.problem_by_id[id];
  }

  getProblemById(id: number): Problem {
    return this.problem_by_id[id] ? this.problem_by_id[id] : null;
  }

  getProblemByNumber(num: number): Problem {
    return this.problem_by_number[num] ? this.problem_by_number[num] : null;
  }

  // Loop through all the problems.
  each(f) {
    for (let problem_id in this.problem_by_id) {
      f(this.problem_by_id[problem_id]);
    }
  }

  private loadProblems() {
    // Prevent duplicate loading.
    if (this.refreshing) return;

    this.refreshing = true;
    console.log('Loading problems ...');

    return this._httpService.get(Config.API_PATH + '/p').then(res => {
      for (let p of res) {
        let problem = new Problem(p);
        this.problem_by_id[problem.id] = problem;
        this.problem_by_number[problem.number] = problem;
      }

      // uhunt_db.set('probs', arr);
      // uhunt_db.set('last_problem_reload', uhunt_util.now());
      this.refreshing = false;

      return res.length;
    });
  }
}
