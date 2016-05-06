import {Component, Input}      from '@angular/core';

import {ProblemComponent}      from './problem';
import {SubmissionsComponent}  from './submissions';

import {User}                  from '../models/user';

import {PollingService}        from '../services/polling';

@Component({
  selector: 'uhunt-live-submissions',
  template:
    `<uhunt-submissions dbname="livesubs"
      [user]="user"
      [submissions]="_pollingService.live_submissions">
    </uhunt-submissions>`, 
  directives: [
    ProblemComponent,
    SubmissionsComponent,
  ],
})
export class LiveSubmissionsComponent {
  @Input() user: User;

  constructor(private _pollingService: PollingService) {}
}
