import {Component, Input} from 'angular2/core';

import {Config}           from '../config';
import {Submission}       from '../models/submission';
import {User}             from '../models/user';

import {PollingService}   from '../services/polling';

import {ElapsedTimePipe}  from '../pipes/elapsed-time';

@Component({
  selector: 'uhunt-live-submissions',
  templateUrl: 'app/components/live-submissions.html', 
  pipes: [ElapsedTimePipe]
})
export class LiveSubmissionsComponent {
  @Input() user: User;

  private live_submissions: Submission[] = [];
  private hide = false;
  private limit = 5;

  private host = Config.UVA_HOST;
  private config = Config;

  constructor(_pollingService: PollingService) {
    _pollingService.submissions.subscribe((subs: Submission[]) => {
      for (var s of subs) {
        this.update(s);
      }
    });
    this.refresh();
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
