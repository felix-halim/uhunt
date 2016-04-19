import {Injectable}     from 'angular2/core';

import {Config}         from '../config';

import {Submission}     from '../models/submission';
import {User}           from '../models/user';

import {HttpService}    from './http';
import {PollingService} from './polling';
import {ProblemService} from './problem';

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
    this._httpService.get(Config.API_PATH + '/subs-user/' + id)
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
          this._problemService.getProblemById(s[1]),
          s[2],
          s[5],
          s[3],
          0, // memory
          s[6],
          s[4]]));
      }

      // this._pollingService.out_of_sync.subscribe(() => {
      //   uhunt_rpc.subs_since(uhunt_user.uid, uhunt_user.lastId(), function(res) {
      //     var arr = res.subs;
      //     for (var i = 0; i < arr.length; i++) {
      //       var s = arr[i];
      //       uhunt_user.update({ sid: s[0], pid: s[1], ver: s[2], run: s[3], sbt: s[4], lan: s[5], rank: s[6] });
      //     }
      //     console.log('submissions is now in sync');
      //   });
      // });

      this._pollingService.submissions.subscribe((subs: Submission[]) => {
        for (var s of subs) {
          if (user.id == s.user.id) {
            user.insertOrUpdate(s);
          }
        }
      });

      resolve(user);
    });
  }
}
