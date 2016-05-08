import {Component}                   from '@angular/core';
import {HTTP_PROVIDERS}              from '@angular/http';
import {RouteConfig,
        RouterOutlet,
        ROUTER_DIRECTIVES}           from '@angular/router-deprecated';

import {WebApiComponent}             from './web-api';
import {ChatBoxComponent}            from './chat-box';
import {CodeReviewComponent}         from './code-review';
import {CodeReviewDetailsComponent}  from './code-review-details';
import {FAQComponent}                from './faq';
import {LogoComponent}               from './logo';
import {StatisticsComponent}         from './statistics';
import {VContestComponent}           from './vcontest/index';
import {VContestScoreboardComponent} from './vcontest/scoreboard';

import {AlgorithmistService}         from '../services/algorithmist';
import {CodeReviewService}           from '../services/code-review';
import {CpBookExercisesService}      from '../services/cp-book-exercises';
import {DatabaseService}             from '../services/database';
import {HttpService}                 from '../services/http';
import {LoginService}                from '../services/login';
import {PollingService}              from '../services/polling';
import {ProblemService}              from '../services/problem';
import {UDebugService}               from '../services/udebug';
import {UserService}                 from '../services/user';
import {VContestService}             from '../services/vcontest';

@Component({
  selector: 'uhunt-app',
  template: `<router-outlet></router-outlet>`,
  directives: [
    ChatBoxComponent,
    LogoComponent,
    ROUTER_DIRECTIVES,
    RouterOutlet,
  ],
  providers: [
    AlgorithmistService,
    CpBookExercisesService,
    CodeReviewService,
    DatabaseService,
    HTTP_PROVIDERS,
    HttpService,
    LoginService,
    PollingService,
    ProblemService,
    UDebugService,
    UserService,
    VContestService,
  ],
})
@RouteConfig([
  { path: '/', name: 'FAQ', component: FAQComponent, useAsDefault: true },
  { path: '/id/:id', name: 'Statistics', component: StatisticsComponent },
  { path: '/cr', name: 'CodeReview', component: CodeReviewComponent },
  { path: '/cr/:id', name: 'CodeReviewDetails',
                     component: CodeReviewDetailsComponent },
  { path: '/vcontest', name: 'VContest', component: VContestComponent },
  { path: '/vcontest/:id', name: 'VContestScoreboard',
                           component: VContestScoreboardComponent },
  { path: '/api', name: 'API', component: WebApiComponent }])
export class AppComponent { }
