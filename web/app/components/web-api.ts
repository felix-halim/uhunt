import {Component}         from 'angular2/core';

import {ChatBoxComponent}  from './chat-box'
import {LogoComponent}     from './logo'

@Component({
  selector: 'uhunt-web-api',
  templateUrl: 'app/components/web-api.html',
  directives: [
    ChatBoxComponent,
    LogoComponent,
  ]
})
export class WebApiComponent {
}
