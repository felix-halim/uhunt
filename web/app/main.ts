import {bootstrap}         from 'angular2/platform/browser';
import {ROUTER_PROVIDERS}  from 'angular2/router';
import {enableProdMode}    from 'angular2/core';
import 'rxjs/Rx';

import {AppComponent}      from './components/app';

// enableProdMode();
bootstrap(AppComponent, [ROUTER_PROVIDERS]);
