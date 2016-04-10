import {Component, Input, OnChanges} from 'angular2/core';

import {Config}               from '../config';

import {User}                 from '../models/user';
import {Problem}              from '../models/problem';
import {Submission}           from '../models/submission';

import {AlgorithmistService}  from '../services/algorithmist';
import {DatabaseService}      from '../services/database';
import {ProblemService}       from '../services/problem';
import {UdebugService}        from '../services/udebug';

import {ElapsedTimePipe}      from '../pipes/elapsed-time';

@Component({
  selector: 'uhunt-user-statistics',
  templateUrl: 'app/components/user-statistics.html',
  pipes: [ElapsedTimePipe]
})
export class UserStatisticsComponent implements OnChanges {
  @Input() user: User;

  private last_submissions: Submission[] = [];
  private solved_problems: Problem[] = [];
  private tried_problems: Problem[] = [];

  private show_solved: string;
  private num_last_subs: number;

  private config = Config;

  constructor(
    private _algorithmistService: AlgorithmistService,
    private _databaseService: DatabaseService,
    private _problemService: ProblemService,
    private _udebugService: UdebugService) {

    this.show_solved =
      this._databaseService.get('uhunt_user_statistics_show_solved') || 'less';

    this.num_last_subs =
      this._databaseService.get('uhunt_user_statistics_num_last_subs') || 5;
  }

  ngOnChanges(changes) {
    this.refresh();
  }

  limit_solved_problems() {
    return Math.min((this.show_solved == 'less')
      ? 500 : 1e10, this.solved_problems.length);
  }

  algorithmist_width(p: Problem) {
    return (this._algorithmistService.exists(p.number) ? 15 : 0)
         + (this._udebugService.exists(p.number) ? 20 : 0);
  }

  set_num_last_subs(n) {
    this._databaseService.set('uhunt_user_statistics_num_last_subs',
      this.num_last_subs = n);
  }

  set_show_solved(show_solved) {
    this._databaseService.set('uhunt_user_statistics_show_solved',
      this.show_solved = show_solved);
  }

  refresh() {
    this.solved_problems = [];
    this.tried_problems = [];
    this._problemService.each((p) => {
      var st = this.user.getProblemStats(p.id);
      if (st.ac) {
        this.solved_problems.push(p);
      } else if (st.ntry > 0) {
        this.tried_problems.push(p);
      }
    });
    this.tried_problems.sort(this.num_cmp);
    this.solved_problems.sort(this.num_cmp);

    var subs = [];
    this.user.each_last_subs(this.num_last_subs, (sub) => subs.push(sub));
    this.last_submissions = subs;
  }

  private num_cmp(a: Problem, b: Problem) {
    return a.number - b.number;
  }
}
