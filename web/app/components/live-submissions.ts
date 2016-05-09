import {Component, Input}      from '@angular/core';

import {ProblemComponent}      from './problem';
import {SubmissionsComponent}  from './submissions';

import {User}                  from '../models/user';
import {LiveSubmissions}       from '../models/live-submissions';

import {PollingService}        from '../services/polling';

@Component({
  selector: 'uhunt-live-submissions',
  template:
    `<uhunt-submissions dbname="livesubs"
      [user]="user"
      [submissions]="live_submissions.submissions">
    </uhunt-submissions>`, 
  directives: [
    ProblemComponent,
    SubmissionsComponent,
  ],
})
export class LiveSubmissionsComponent {
  @Input() user: User;

  live_submissions = new LiveSubmissions();

  constructor(pollingService: PollingService) {
    this.live_submissions.subscribe(pollingService.submissions);
  }
}
