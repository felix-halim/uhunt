import {Component, Input, OnChanges} from '@angular/core';

import {Config}                      from '../config';

import {ProblemStatisticsComponent}  from './problem-statistics';

import {User}                        from '../models/user';
import {Problem}                     from '../models/problem';
import {Submission}                  from '../models/submission';

import {DatabaseService}             from '../services/database';
import {ProblemService}              from '../services/problem';

@Component({
  selector: 'uhunt-problem-search',
  templateUrl: 'app/components/problem-search.html',
  directives: [ProblemStatisticsComponent],
})
export class ProblemSearchComponent implements OnChanges {
  @Input() user: User;

  private search_number: string;
  private searched_problem: Problem;
  private show_search_result: boolean;

  private config = Config;

  constructor(
    private _databaseService: DatabaseService,
    private _problemService: ProblemService) {

    this.search_number =
      this._databaseService.get('uhunt_prob_search_number') || '';

    this.show_search_result =
      this._databaseService.get('uhunt_prob_search_show_result') || false;
  }

  ngOnChanges(changes) {
    if (this.show_search_result) {
      this._problemService.ready.then(() => this.search());
    }
  }

  private set_show_search_result(show: boolean) {
    this._databaseService.set('uhunt_prob_search_show_result',
      this.show_search_result = show);
  }

  private search() {
    this._databaseService.set('uhunt_prob_search_number', this.search_number);

    var num = parseInt(this.search_number, 10);
    this.searched_problem = this._problemService.getProblemByNumber(num);
    this.set_show_search_result(!!this.searched_problem.id);
  }
}
