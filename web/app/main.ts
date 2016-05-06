import {bootstrap}         from '@angular/platform-browser-dynamic';
import {enableProdMode}    from '@angular/core';
import {ROUTER_PROVIDERS}  from '@angular/router-deprecated';
import 'rxjs/Rx';

import {AppComponent}      from './components/app';

// enableProdMode();
bootstrap(AppComponent, [ROUTER_PROVIDERS]);
