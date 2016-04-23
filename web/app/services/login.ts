import {Injectable, EventEmitter} from 'angular2/core';

import {Config}                   from '../config';

import {ChatMessage}              from '../models/chat';
import {Submission}               from '../models/submission';
import {User}                     from '../models/user';

import {DatabaseService}          from './database';
import {MD5}                      from './md5';
import {HttpService}              from './http';
import {ProblemService}           from './problem';
import {PollingService}           from './polling';

@Injectable()
export class LoginService {
  private status_changed: EventEmitter<User> = new EventEmitter();
  logged_in_user: User = new User({});
  logging_in: boolean;

  constructor(
    private _databaseService: DatabaseService,
    private _httpService: HttpService,
    private _problemService: ProblemService,
    private _pollingService: PollingService) {}

  subscribe(cb: (User) => void) {
    if (this.logged_in_user) {
      cb(this.logged_in_user);
    }
    this.status_changed.subscribe(cb);
  }

  sign_in(uname, ucode, as_invisible) {
    if (!ucode || ucode.trim().length == 0) return;
    this.logging_in = true;
    var ts = new Date().getTime();
    var digest = MD5.hash(ts + ';' + ucode);
    this._httpService.post_text(Config.UHUNT_HOST + '/chat/login/'
      + this._pollingService.session_id + '/' + uname + '/' + digest + '/'
      + ts + '/' + as_invisible)
    .then(res => {
      var ok = res._body;
      this.logged_in_user = new User({ username: uname });
      if (ok === 'ok') {
        this._databaseService.set('username', uname);
        this._databaseService.set('uhunt-code', ucode);
        this._databaseService.set('logged-in', true);
        this.logged_in_user.since = new Date().getTime();
      } else if (ok === 'invalid code') {
        alert('Invalid UVa username / uHunt code');
        this.logged_in_user.since = 0;
        this._databaseService.set('logged-in', false);
      }
      this.status_changed.emit(this.logged_in_user);
      this.logging_in = false;
    });
  }

  sign_out() {
    this.logging_in = true;
    this._httpService.post_text(Config.UHUNT_HOST + '/chat/logout/'
      + this._pollingService.session_id)
    .then(ok => {
      this._databaseService.set('logged-in', false);
      this.logged_in_user.since = 0;
      this.status_changed.emit(this.logged_in_user);
      this.logging_in = false;
    });
  }
}
