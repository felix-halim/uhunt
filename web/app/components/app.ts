import {Component}               from 'angular2/core';
import {HTTP_PROVIDERS}          from 'angular2/http';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';

import {MainComponent}           from './main';
import {UserStatisticsComponent} from './user-statistics';

import {HttpService}             from '../services/http';
import {PollingService}          from '../services/polling';
import {ProblemService}          from '../services/problem';
import {UserService}             from '../services/user';

@Component({
  selector: 'uhunt-app',
  template: `<router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES],
  providers: [
    HttpService,
    PollingService,
    ProblemService,
    UserService,
    HTTP_PROVIDERS,
    ROUTER_PROVIDERS
  ],
})
@RouteConfig([{
  path: '/',
  name: 'Main',
  component: MainComponent,
  useAsDefault: true
}, {
  path: '/id/:id',
  name: 'UserStatistics',
  component: UserStatisticsComponent
}])
export class AppComponent {}
