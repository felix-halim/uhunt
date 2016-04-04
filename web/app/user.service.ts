import {Injectable}     from 'angular2/core';

import {Settings}       from './settings';
import {Submission}     from './submission';
import {User}           from './user';

import {HttpService}    from './http.service';
import {PollingService} from './polling.service';
import {ProblemService} from './problem.service';

@Injectable()
export class UserService {

  constructor(
    private _httpService: HttpService,
    private _problemService: ProblemService,
    private _pollingService: PollingService) {
  }

  getUser(id: number): Promise<User> {
    return new Promise<User>((resolve) => {
      this.loadUser(id, resolve);
    });
  }

  private loadUser(id: number, resolve) {
    this._httpService.get(Settings.API_PATH + '/subs-user/' + id)
      .then(res => {
        this.subscribeUser(new User({
          userid: id,
          name: res.name,
          username: res.uname
        }), res.subs, resolve);
      });
  }

  private subscribeUser(user, submissions, resolve) {
    this._problemService.ready.then(() => {
      for (let s of submissions) {
        user.insertOrUpdate(new Submission([
          s[0],
          user,
          this._problemService.getProblem(s[1]),
          s[2],
          s[5],
          s[3],
          0, // memory
          s[6],
          s[4]]));
      }

      this._pollingService.submissions.subscribe((s: Submission) => {
        if (user.id == s.user.id) {
          user.insertOrUpdate(s);
        }
      });

      resolve(user);
    });
  }
}
