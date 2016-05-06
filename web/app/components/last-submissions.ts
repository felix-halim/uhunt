import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';

import {Config}                      from '../config';

import {ProblemComponent}            from './problem'

import {User}                        from '../models/user';
import {Submission, Verdict}         from '../models/submission';

import {DatabaseService}             from '../services/database';
import {ProblemService}              from '../services/problem';

import {ElapsedTimeDirective}        from '../directives/elapsed-time';

@Component({
  selector: 'uhunt-last-submissions',
  templateUrl: 'app/components/last-submissions.html',
  directives: [
    ProblemComponent,
    ElapsedTimeDirective,
  ],
})
export class LastSubmissionsComponent implements OnChanges {
  @Input() user: User;
  @Output('world-ranklist') worldRanklistClicked: EventEmitter<boolean> = new EventEmitter();

  private last_submissions: Submission[] = [];
  private num_last_subs: number;
  private config = Config;

  constructor(
    private _databaseService: DatabaseService,
    private _problemService: ProblemService) {

    this.num_last_subs =
      this._databaseService.get('uhunt_user_statistics_num_last_subs') || 5;
  }

  ngOnChanges(changes) {
    this._problemService.ready.then(() => this.refresh());
  }

  refresh() {
    var subs = [];
    this.user.each_last_subs(10000, (sub) => subs.push(sub));
    this.last_submissions = subs;
  }

  set_num_last_subs(n) {
    this._databaseService.set('uhunt_user_statistics_num_last_subs',
      this.num_last_subs = n);
  }
}
