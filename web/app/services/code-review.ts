import {Injectable}       from '@angular/core';

import {Observable}       from 'rxjs/Observable';
import {Observer}         from 'rxjs/Observer';

import {Config}           from '../config';

import {Problem}          from '../models/problem';
import {CodeReview,
        CodeReviewSize,
        CodeReviewStatus} from '../models/code-review';

import {DatabaseService}  from './database';
import {ProblemService}  from './problem';
import {HttpService}      from './http';

@Injectable()
export class CodeReviewService {
  code_reviews = [];

  constructor(
    private _httpService: HttpService,
    private _problemService: ProblemService,
    private _databaseService: DatabaseService) {

    this._problemService.ready.then(() => {
      this.code_reviews.push({
        id: 10,
        problem: this._problemService.getProblemByNumber(100),
        user: { id: 339, username: 'felix_halim', name: 'Felix Halim' },
        status: CodeReviewStatus.BUG,
        size: CodeReviewSize.LARGE,
        last_comment_ts: Config.now,
        last_comment_by: { id: 244, username: 'suhendry' },
        last_comment_snippet: 'last comment'
      });
    });
  }

  get(id: number) {
    return this.code_reviews[0];
  }
}
