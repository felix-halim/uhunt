import {Component, Input, OnInit}  from 'angular2/core';

import {Config}                    from '../config';

import {ProblemComponent}          from '../components/problem';

import {Submission}                from '../models/submission';
import {User}                      from '../models/user';

import {PollingService}            from '../services/polling';
import {DatabaseService}           from '../services/database';

import {ElapsedTimeDirective}      from '../directives/elapsed-time';

@Component({
  selector: 'uhunt-submissions',
  templateUrl: 'app/components/submissions.html',
  directives: [
    ProblemComponent,
    ElapsedTimeDirective,
  ],
})
export class SubmissionsComponent implements OnInit {
  @Input() user: User;
  @Input() submissions: Submission[];
  @Input() limits = [5, 10, 50, 100];
  @Input() dbname: string;

  private limit_dbkey: string;
  private show_dbkey: string;

  private show;
  private limit;

  private host = Config.UVA_HOST;
  private config = Config;

  constructor(
    private _pollingService: PollingService,
    private _databaseService: DatabaseService) {}

  ngOnInit() {
    this.limit_dbkey = 'uhunt_' + this.dbname + '_limit';
    this.show_dbkey = 'uhunt_' + this.dbname + '_show';
    this.limit = this._databaseService.get(this.limit_dbkey) || 5;
    this.show = this._databaseService.get(this.show_dbkey);
  }

  set_limit(n) {
    this._databaseService.set(this.limit_dbkey, this.limit = n);
  }

  set_show(show) {
    this._databaseService.set(this.show_dbkey, this.show = show);
  }
}
