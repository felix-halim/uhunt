import {Component, Input}      from 'angular2/core';

import {Config}                from '../config';

import {ProblemComponent}      from '../components/problem';

import {Submission}            from '../models/submission';
import {User}                  from '../models/user';

import {PollingService}        from '../services/polling';
import {DatabaseService}       from '../services/database';

import {ElapsedTimeDirective}  from '../directives/elapsed-time';

@Component({
  selector: 'uhunt-live-submissions',
  templateUrl: 'app/components/live-submissions.html', 
  directives: [
    ProblemComponent,
    ElapsedTimeDirective,
  ],
})
export class LiveSubmissionsComponent {
  @Input() user: User;

  private show;
  private limit;

  private host = Config.UVA_HOST;
  private config = Config;

  constructor(
      private _pollingService: PollingService,
      private _databaseService: DatabaseService) {

    this.limit = this._databaseService.get('uhunt_livesubs_limit') || 5;
    this.show = this._databaseService.get('uhunt_livesubs_show');
  }

  set_limit(n) {
    this._databaseService.set('uhunt_livesubs_limit', this.limit = n);
  }

  set_show(show) {
    this._databaseService.set('uhunt_livesubs_show', this.show = show);
  }
}
