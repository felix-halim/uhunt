import {Component, OnInit, Input}     from 'angular2/core';
import {RouteParams,
        RouterOutlet,
        RouteConfig}                  from 'angular2/router';
import {Control}                      from 'angular2/common';

import {Config}                       from '../../config';

import {User}                         from '../../models/user';
import {Problem}                      from '../../models/problem';
import {Submission}                   from '../../models/submission';

import {DatabaseService}              from '../../services/database';
import {HttpService}                  from '../../services/http';
import {ProblemService}               from '../../services/problem';
import {UserService}                  from '../../services/user';

import {PastContestsPickerComponent}  from '../past-contests-picker';
import {ProblemsPickerComponent}      from '../problems-picker';
import {VContestGenComponent}         from './generator';

@Component({
  selector: 'uhunt-vcontest',
  template: `
    <br style="clear:both" />
    <hr>
    <router-outlet></router-outlet>
  `,
  directives: [
    RouterOutlet,
    VContestGenComponent,
    ProblemsPickerComponent,
    PastContestsPickerComponent,
  ],
})
@RouteConfig([{
  path: '/',
  name: 'Generator',
  component: VContestGenComponent,
  useAsDefault: true
}])
export class VContestComponent implements OnInit {
  @Input() user: User = User.UNKNOWN;

  constructor(
    private _routeParams: RouteParams,
    private _userService: UserService) { }

  ngOnInit() {
    var currentUserId = parseInt(this._routeParams.get('id'), 10);
    this._userService.getUser(currentUserId).then(user => this.user = user);
  }
}
