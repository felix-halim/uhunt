import {Injectable, EventEmitter} from 'angular2/core';

import {Settings}                 from './settings';
import {Submission}               from './submission';
import {User}                     from './user';

import {HttpService}              from './http.service';
import {ProblemService}           from './problem.service';

@Injectable()
export class PollingService {
  submissions: EventEmitter<Submission> = new EventEmitter();
  last_poll_id: number = 0;

  constructor(
    private _httpService: HttpService,
    private _problemService: ProblemService) {
    this.poll();
  }

  poll() {
    this._httpService.get(Settings.API_PATH + '/poll/' + this.last_poll_id)
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
