import { Observable, Subscribable }  from 'rxjs/Observable'
import { Subscriber }                from 'rxjs/Subscriber'
import { AnonymousSubscription }     from 'rxjs/Subscription'

import { Config }        from '../config';

import { User }          from './user';
import { Problem }       from './problem';
import { Submission }    from './submission';

export class Contest {
  private static ticks = Observable.interval(1000);
  subscription: AnonymousSubscription;
  reset_first: boolean;

  past_submissions: Submission[] = [];
  status = ContestStatus.START_DATE;

  author_by_id: {[prop: number]: Author};
  author_ranklist: Author[];

  is_problem_id: { [key: number]: boolean };
  is_contestant_id: { [key: number]: boolean };

  constructor(
    public id: number,
    public name: string,
    public start_ts: number,
    public end_ts: number,
    public contestants: User[],
    public problems: Problem[]) {

    this.reset();
  }

  is_contestant(uid: number) {
    return this.is_contestant_id[uid];
  }

  reset() {
    this.is_problem_id = {};
    for (let problem of this.problems) {
      this.is_problem_id[problem.id] = true;
    }

    this.is_contestant_id = {};
    this.author_by_id = {};
    this.author_ranklist = [];
    for (let user of this.contestants) {
      this.is_contestant_id[user.id] = true;
      this.author_by_id[user.id] = new Author(user, this.problems);
      this.author_ranklist.push(this.author_by_id[user.id]);
    }
  }

  subscribe(subscribable: Subscribable<Submission[]>) {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.reset_first = true;
    }
    this.subscription = subscribable.subscribe(subs => {
      if (this.reset_first) {
        this.reset();
        this.reset_first = false;
      }
      for (let s of subs) {
        if (s.submit_time < this.start_ts) continue;
        if (s.submit_time > this.end_ts) continue;
        if (!this.is_problem_id[s.problem.id]) continue;

        let a = this.author_by_id[s.user.id];
        if (!a) {
          a = this.author_by_id[s.user.id] = new Author(s.user, this.problems);
          this.author_ranklist.push(a);
        }

        var p = a.status;
        if (!p[s.problem.id]) p[s.problem.id] = new Status();
        if (p[s.problem.id].ac) continue;
        if (s.verdict == 90) {
          p[s.problem.id].ac = 1;
          p[s.problem.id].sbt = s.submit_time - this.start_ts;
          a.solved++;
          a.penalty += p[s.problem.id].sbt + p[s.problem.id].nos * 20 * 60;
        } else {
          p[s.problem.id].nos++;
        }
      }

      this.author_ranklist.sort((a, b) => (a.solved != b.solved)
        ? (b.solved - a.solved) : (a.penalty - b.penalty));
    });
  }

  start_shadow_submisions() {
    return new Observable<Submission[]>(
      (observer: Subscriber<Submission[]>) => {
        let i = 0;
        let subscription = Contest.ticks.subscribe(() => {
          let arr: Submission[] = [];
          let now = Config.now;
          while (i < this.past_submissions.length) {
            var s = this.past_submissions[i];
            if (s.submit_time > now) break;
            arr.push(s);
            i++;
          }
          if (arr.length > 0) {
            observer.next(arr);
          }
          if (i >= this.past_submissions.length) {
            subscription.unsubscribe();
            observer.complete();
          }
        });
      });
  }
}

export enum ContestStatus {
  START_DATE,
  STARTING_IN,
  STARTING,
  RUNNING,
};

export class Author {
  solved = 0;
  penalty = 0;
  status: {[prop: number]: Status} = {};

  constructor(public user: User, public problems: Problem[]) { }

  get problems_status() {
    return this.problems.map(p => this.status[p.id]);
  }
}

class Status {
  ac = 0;
  nos = 0;
  sbt = 0;
}
