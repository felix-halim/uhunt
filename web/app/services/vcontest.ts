import { Injectable }         from '@angular/core';

import { Observable,
         Subscribable }       from 'rxjs/Observable'
import { Subscriber }         from 'rxjs/Subscriber'

import { Config }             from '../config';

import { DeltaTimeAdjuster }  from '../models/delta-time-adjuster'

import { Contest,
         ContestStatus }      from '../models/contest';
import { Problem }            from '../models/problem';
import { Submission }         from '../models/submission';
import { User }               from '../models/user';

import { HttpService }        from './http';
import { ProblemService }     from './problem';

@Injectable()
export class VContestService {

  remote_adjuster = new DeltaTimeAdjuster(0);

  constructor(
    private httpService: HttpService,
    private problemService: ProblemService) {}

  start(id: string): Promise<Contest> {
    return new Promise<Contest>(resolve => this.try_start(id, resolve));
  }

  private try_start(id: string, resolve: (c: Contest) => void) {
    this.httpService.get(
      Config.UHUNT_HOST + '/vcontest-data/' + id).then(c => {
        let contest = this.parse_contest(c);
        this.remote_adjuster.set_now(c.server_time);
        let start_in = -this.remote_adjuster.get_elapsed(c.start_sbt);
        if (start_in >= 30 * 24 * 60 * 60) {
          contest.status = ContestStatus.START_DATE;
          resolve(contest);
          let delay = start_in - 30 * 24 * 60 * 60 + 1;
          setTimeout(() => this.try_start(id, resolve), delay * 1000);
        } if (start_in > 1) {
          contest.status = ContestStatus.STARTING_IN;;
          resolve(contest);
          setTimeout(() => this.try_start(id, resolve), (start_in - 1) * 1000);
        } else if (c.problem_numbers[0] == -1) {
          contest.status = ContestStatus.STARTING;
          resolve(contest);
          setTimeout(() => this.try_start(id, resolve), 1000);
        } else if (!contest.id) {
          contest.status = ContestStatus.RUNNING;
          resolve(contest);
        } else {
          this.fill_contest_details(contest).then(() => {
            contest.status = ContestStatus.RUNNING;
            resolve(contest);
          });
        }
      });
  }

  private parse_contest(c: any): Contest {
    if (!Array.isArray(c.user_ids)) {
      c.user_ids = [c.user_ids];
    }
    if (!Array.isArray(c.problem_numbers)) {
      c.problem_numbers = [c.problem_numbers];
    }

    let contestants: User[] = [];
    for (let uid of c.user_ids) {
      contestants.push(
        new User({ userid: uid, name: '-- ? --', username: '-- ? --' }));
    }
    let problems: Problem[] = [];
    for (let num of c.problem_numbers) {
      problems.push(this.problemService.getProblemByNumber(num));
    }
    return new Contest(
      c.contest_id, '', c.start_sbt, c.end_sbt, contestants, problems);
  }

  private fill_contest_details(contest: Contest) {
    return Promise.all([
      // TODO: cache contest detail in local database.
      this.httpService.get(Config.API_PATH + '/contests/id/' + contest.id),
      this.problemService.ready
    ]).then(res => {
      this.fill_shadow_submissions(contest, res[0]);
      contest.past_submissions.sort((a, b) => a.submit_time - b.submit_time);
    });
  }

  private fill_shadow_submissions(contest: Contest, cd: any) {
    contest.name = cd.name;

    // TODO: set this in the generator site.
    contest.end_ts = contest.start_ts + cd.endtime - cd.starttime;

    // Adjust the submit time of the shadow.
    var shadow_start_sbt = contest.start_ts - cd.starttime;

    let sid = 1;
    for (let s of cd.subs) {
      contest.past_submissions.push(new Submission([
        sid++,
        new User({ userid: s[3], name: s[6], username: s[7] }),
        this.problemService.getProblemByNumber(s[0]),
        s[1],
        s[5],
        s[2],
        0,
        -1,
        s[4] + shadow_start_sbt
      ]));
    }
  }

  start_past_submissions(contest: Contest) {
    return new Observable<Submission[]>(
      (observer: Subscriber<Submission[]>) => {
        this.httpService.get(Config.API_PATH + '/subs-pids/'
          + contest.contestants.map(u => u.id).join(',') + '/'
          + contest.problems.map(p => p.number).join(',') + '/0')
        .then(subs_by_user => {
          for (let key in subs_by_user) {
            let uid = parseInt(key, 10);
            let a = subs_by_user[uid];
            for (let user of contest.contestants) {
              if (user.id == uid) {
                user.name = a.name;
                user.username = a.uname;
                break;
              }
            }
            let subs: Submission[] = [];
            for (let sub of a.subs) {
              subs.push(new Submission([
                parseInt(sub[0], 10),
                new User({ userid: uid, name: a.name, username: a.uname }),
                this.problemService.getProblemById(parseInt(sub[1], 10)),
                parseInt(sub[2], 10),
                parseInt(sub[5], 10),
                parseInt(sub[3], 10),
                0,
                parseInt(sub[6], 10),
                parseInt(sub[4], 10)
              ]));
            }
            subs.sort((a, b) => a.submit_time - b.submit_time);
            observer.next(subs);
            observer.complete();
          }
        });
      });
  }
}
