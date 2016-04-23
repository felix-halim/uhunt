import {Component}               from 'angular2/core';
import {HTTP_PROVIDERS}          from 'angular2/http';
import {RouteConfig,
        RouterOutlet,
        ROUTER_DIRECTIVES}       from 'angular2/router';

import {WebApiComponent}         from './web-api';
import {ChatBoxComponent}        from './chat-box';
import {CodeReviewComponent}     from './code-review';
import {FAQComponent}            from './faq';
import {LogoComponent}           from './logo';
import {StatisticsComponent}     from './statistics';
import {VContestComponent}       from './vcontest/index';

import {AlgorithmistService}     from '../services/algorithmist';
import {CpBookExercisesService}  from '../services/cp-book-exercises';
import {DatabaseService}         from '../services/database';
import {HttpService}             from '../services/http';
import {LoginService}            from '../services/login';
import {PollingService}          from '../services/polling';
import {ProblemService}          from '../services/problem';
import {UDebugService}           from '../services/udebug';
import {UserService}             from '../services/user';

@Component({
  selector: 'uhunt-app',
  template:
`<uhunt-chat-box width="550" height="245" style="float:right; padding-left:25px"
   [user]="user">
</uhunt-chat-box>
<uhunt-logo highlite="vc" [user]="user"></uhunt-logo>
<router-outlet></router-outlet>`,
  directives: [
    ChatBoxComponent,
    LogoComponent,
    ROUTER_DIRECTIVES,
    RouterOutlet,
  ],
  providers: [
    AlgorithmistService,
    CpBookExercisesService,
    DatabaseService,
    HTTP_PROVIDERS,
    HttpService,
    LoginService,
    PollingService,
    ProblemService,
    UDebugService,
    UserService,
  ],
})
@RouteConfig([{
  path: '/',
  name: 'FAQ',
  component: FAQComponent,
  useAsDefault: true
}, {
  path: '/id/:id',
  name: 'Statistics',
  component: StatisticsComponent
}, {
  path: '/cr',
  name: 'CodeReview',
  component: CodeReviewComponent
}, {
  path: '/vcontest/...',
  name: 'VContest',
  component: VContestComponent
}, {
  path: '/api',
  name: 'API',
  component: WebApiComponent
}])
export class AppComponent {}
