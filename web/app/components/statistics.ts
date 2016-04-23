import {Component, OnInit}        from 'angular2/core';
import {RouteParams}              from 'angular2/router';

import {ChatBoxComponent}         from './chat-box';
import {CpBookExercisesComponent} from './cp-book-exercises';
import {LiveSubmissionsComponent} from './live-submissions';
import {LogoComponent}            from './logo';
import {NextProblemsComponent}    from './next-problems';
import {ProblemSearchComponent}   from './problem-search';
import {StatsComparerComponent}   from './statistics-comparer';
import {UsernameInputComponent}   from './username-input';
import {UserStatisticsComponent}  from './user-statistics';
import {WebApiComponent}          from './web-api';
import {WorldRanklistComponent}   from './world-ranklist';

import {User}                     from '../models/user';

import {ProblemService}           from '../services/problem';
import {UserService}              from '../services/user';

@Component({
  selector: 'uhunt-statistics',
  templateUrl: 'app/components/statistics.html',
  directives: [
    ChatBoxComponent,
    CpBookExercisesComponent,
    LiveSubmissionsComponent,
    LogoComponent,
    NextProblemsComponent,
    ProblemSearchComponent,
    StatsComparerComponent,
    UsernameInputComponent,
    UserStatisticsComponent,
    WebApiComponent,
    WorldRanklistComponent,
  ]
})
export class StatisticsComponent implements OnInit {
  user: User = User.UNKNOWN;

  constructor(
    private _routeParams: RouteParams,
    private _userService: UserService) {}

  ngOnInit() {
    var currentUserId = parseInt(this._routeParams.get('id'), 10);
    this._userService.getUser(currentUserId).then(user => this.user = user);
  }
}
