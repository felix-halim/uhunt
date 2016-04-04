import {Component, OnInit}        from 'angular2/core';
import {RouteParams}              from 'angular2/router';

import {LiveSubmissionsComponent} from './live-submissions.component';

import {User}                     from './user';

import {ProblemService}           from './problem.service';
import {UserService}              from './user.service';

@Component({
  selector: 'uhunt-user-statistics',
  template: `
    <h1>{{user.name}} ({{user.username}}) statistics</h1>
    <uhunt-live-submissions [user]="user"></uhunt-live-submissions>
  `,
  directives: [LiveSubmissionsComponent]
})
export class UserStatisticsComponent implements OnInit {
  user: User = User.UNKNOWN;

  constructor(
    private _routeParams: RouteParams,
    private _userService: UserService,
    private _problemService: ProblemService) {}

  ngOnInit() {
    var currentUserId = parseInt(this._routeParams.get('id'), 10);
    Promise.all<any>([
      this._problemService.ready,
      this._userService.getUser(currentUserId)
    ])
    .then(values => this.user = values[1]);
  }
}
