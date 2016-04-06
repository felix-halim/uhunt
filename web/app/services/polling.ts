import {Injectable, EventEmitter} from 'angular2/core';

import {Config}                   from '../config';

import {ChatMessage}              from '../models/chat';
import {Submission}               from '../models/submission';
import {User}                     from '../models/user';

import {HttpService}              from './http';
import {ProblemService}           from './problem';

@Injectable()
export class PollingService {
  submissions: EventEmitter<Submission> = new EventEmitter();
  chat_messages: EventEmitter<ChatMessage> = new EventEmitter();
  last_poll_id: number = 0;

  constructor(
    private _httpService: HttpService,
    private _problemService: ProblemService) {
    this.poll();
  }

  poll() {
    this._httpService.get(Config.API_PATH + '/poll/' + this.last_poll_id)
      .then(res => {
        this._problemService.ready.then(() => this.process_response(res))
      });
  }

  private process_response(res) {
    for (let r of res) {
      this.last_poll_id = Math.max(this.last_poll_id, r.id);
      if (r.type === 'lastsubs') {
        this.emit_submission(r.msg);
      }
    }
    this.poll();
  }

  private emit_submission(s) {
    this.submissions.emit(new Submission([
      s.sid,
      new User({
        userid: s.uid,
        name: s.name,
        username: s.uname
      }),
      this._problemService.getProblem(s.pid),
      s.ver,
      s.lan,
      s.run,
      s.mem,
      s.rank,
      s.sbt]));
  }
}
