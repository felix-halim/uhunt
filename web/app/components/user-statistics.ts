import {Component, OnInit}        from 'angular2/core';
import {RouteParams}              from 'angular2/router';

import {ChatBoxComponent}         from './chat-box';
import {LiveSubmissionsComponent} from './live-submissions';
import {ProblemSearchComponent}   from './problem-search';
import {UsernameInputComponent}   from './username-input';

import {User}                     from '../models/user';

import {ProblemService}           from '../services/problem';
import {UserService}              from '../services/user';

@Component({
  selector: 'uhunt-user-statistics',
  templateUrl: 'app/components/user-statistics.html',
  directives: [
    ChatBoxComponent,
    LiveSubmissionsComponent,
    ProblemSearchComponent,
    UsernameInputComponent,
  ]
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
