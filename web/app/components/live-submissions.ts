import {Component, Input} from 'angular2/core';

import {Config}           from '../config';
import {Submission}       from '../models/submission';
import {User}             from '../models/user';

import {PollingService}   from '../services/polling';
import {DatabaseService}  from '../services/database';

import {ElapsedTimePipe}  from '../pipes/elapsed-time';

@Component({
  selector: 'uhunt-live-submissions',
  templateUrl: 'app/components/live-submissions.html', 
  pipes: [ElapsedTimePipe]
})
export class LiveSubmissionsComponent {
  @Input() user: User;

  private live_submissions: Submission[] = [];
  private show;
  private limit;

  private host = Config.UVA_HOST;
  private config = Config;

  constructor(
      private _pollingService: PollingService,
      private _databaseService: DatabaseService) {

    this.limit = this._databaseService.get('uhunt_livesubs_limit') || 5;
    this.show = this._databaseService.get('uhunt_livesubs_show');

    this._pollingService.submissions.subscribe((subs: Submission[]) => {
      for (var s of subs) {
        this.update(s);
      }
    });
    this.refresh();
  }

  set_limit(n) {
    this._databaseService.set('uhunt_livesubs_limit', this.limit = n);
  }

  set_show(show) {
    this._databaseService.set('uhunt_livesubs_show', this.show = show);
  }

  private update(sub) {
    var replaced = false;
    for (let i = 0; i < this.live_submissions.length; i++) {
      var s = this.live_submissions[i];
      if (s.id == sub.id) {
        this.live_submissions[i] = sub;
        replaced = true;
      }
    }
    if (!replaced) {
      this.live_submissions.unshift(sub);
      if (this.live_submissions.length > 100) {
        this.live_submissions.pop();
      }
    }
  }

  private refresh() {
    for (let s of this.live_submissions) {
      s.submit_time += 1e-6;
    }
    setTimeout(() => this.refresh(), 1000);
  }
}
