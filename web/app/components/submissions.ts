import {Component, Input, OnInit}  from '@angular/core';

import {Config}                    from '../config';

import {ProblemComponent}          from '../components/problem';

import {Submission}                from '../models/submission';
import {User}                      from '../models/user';

import {PollingService}            from '../services/polling';
import {DatabaseService}           from '../services/database';

import {TimerComponent}            from '../components/timer';

@Component({
  selector: 'uhunt-submissions',
  templateUrl: 'app/components/submissions.html',
  directives: [
    ProblemComponent,
    TimerComponent,
  ],
})
export class SubmissionsComponent implements OnInit {
  @Input() user: User;
  @Input() submissions: Submission[];
  @Input() limits = [5, 10, 50, 100];
  @Input() dbname: string;

  private limit_dbkey: string;
  private show_dbkey: string;

  private show: number;
  private limit: number;

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

  set_limit(n: number) {
    this._databaseService.set(this.limit_dbkey, this.limit = n);
  }

  set_show(show: number) {
    this._databaseService.set(this.show_dbkey, this.show = show);
  }
}
