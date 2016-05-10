import {Injectable}         from '@angular/core';

import {Observable}         from 'rxjs/Observable';
import {Subscriber}         from 'rxjs/Subscriber';
import {Observer}           from 'rxjs/Observer';

import {Config}             from '../config';

import {DeltaTimeAdjuster}  from '../models/delta-time-adjuster'

import {Contest,
        ContestStatus}      from '../models/contest';
import {Problem}            from '../models/problem';
import {Submission}         from '../models/submission';
import {User}               from '../models/user';

import {DatabaseService}    from './database';
import {HttpService}        from './http';
import {ProblemService}     from './problem';

@Injectable()
export class VContestService {

  remote_adjuster = new DeltaTimeAdjuster(0);

  constructor(
    private httpService: HttpService,
    private problemService: ProblemService,
    private databaseService: DatabaseService) {}

  start(id: string): Observable<Contest> {
    return new Observable<Contest>(
      (observer: Subscriber<Contest>) => this.try_start(id, observer));
  }

  private try_start(id: string, observer: Subscriber<Contest>) {
    this.httpService.get(
      Config.UHUNT_HOST + '/vcontest-data/' + id).then(c => {
        console.log('trystart ' , c);
        let contest = this.parse_contest(c);
        this.remote_adjuster.set_now(c.server_time);
        let start_in = -this.remote_adjuster.get_elapsed(c.start_sbt);
        if (start_in >= 30 * 24 * 60 * 60) {
          contest.status = ContestStatus.START_DATE;
          observer.next(contest);
          let delay = start_in - 30 * 24 * 60 * 60 + 1;
          setTimeout(() => this.try_start(id, observer), delay * 1000);
        } if (start_in > 1) {
          contest.status = ContestStatus.STARTING_IN;;
          observer.next(contest);
          setTimeout(() => this.try_start(id, observer), (start_in - 1) * 1000);
        } else if (c.problem_numbers[0] == -1) {
          contest.status = ContestStatus.STARTING;
          observer.next(contest);
          setTimeout(() => this.try_start(id, observer), 1000);
        } else if (!contest.id) {
          contest.status = ContestStatus.RUNNING;
          observer.next(contest);
          observer.complete();
        } else {
          this.fill_contest_details(contest).then(() => {
            contest.status = ContestStatus.RUNNING;
            observer.next(contest);
            observer.complete();
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

    let contest = new Contest();
    contest.id = c.contest_id;
    contest.start_ts = c.start_sbt;
    contest.end_ts = c.end_sbt;
    for (let uid of c.user_ids) {
      contest.contestants.push(new User({ userid: uid }));
    }
    for (let num of c.problem_numbers) {
      contest.problems.push(this.problemService.getProblemByNumber(num));
    }
    contest.create_ranklist();
    return contest;
  }

  private fill_contest_details(contest: Contest) {
    return Promise.all([
      this.httpService.get(Config.API_PATH + '/contests/id/' + contest.id),
      this.problemService.ready
    ]).then(res => {
      let cd = res[0];
      contest.name = cd.name;

      // TODO: set this in the generator site.
      contest.end_ts =
        contest.start_ts + cd.endtime - cd.starttime;

      // Adjust the submit time of the shadow.
      var shadow_start_sbt = contest.start_ts - cd.starttime;

      let sid = 1;
      cd.subs.sort((a: any, b: any) => a[4] - b[4]); // sort by submit time
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
    });
  }

  get_contestant_submissions(c: Contest): Observable<Submission[]> {
    return new Observable<Submission[]>((o: Subscriber<Submission[]>) => {
      this.httpService.get(Config.API_PATH + '/subs-pids/'
        + c.contestants.map(u => u.id).join(',') + '/'
        + c.problems.map(p => p.number).join(',') + '/0')
      .then(subs_by_user => {
        let subs: Submission[] = [];
        for (let uid in subs_by_user) {
          let a = subs_by_user[uid];
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
        }
        subs.sort((a, b) => a.submit_time - b.submit_time);
        o.next(subs);
      });
    });
  }
}
