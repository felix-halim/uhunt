import { Observable,
         Subscribable }  from 'rxjs/Observable'
import { Subscriber }    from 'rxjs/Subscriber'
import { Subscription }  from 'rxjs/Subscription'

import { Config }        from '../config';

import { User }          from './user';
import { Problem }       from './problem';
import { Submission }    from './submission';

export class Contest {
  private static ticks = Observable.interval(1000);

  id: number;
  name: string;
  start_ts: number;
  end_ts: number;
  contestants: User[] = [];
  problems: Problem[] = [];
  past_submissions: Submission[] = [];
  status: ContestStatus;

  ranklist = new Ranklist(this);

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

  subscribe(subscribable: Subscribable<Submission[]>) {
    subscribable.subscribe((subs) => this.ranklist.add_submission(subs));
  }
}

export enum ContestStatus {
  START_DATE,
  STARTING_IN,
  STARTING,
  RUNNING,
};

export class Ranklist {
  submissions: Submission[] = [];
  valid_problem_id: { [key: number]: boolean } = {};
  valid_user_id: { [key: number]: boolean } = {};

  constructor(private contest: Contest) {
    for (let problem of contest.problems) {
      this.valid_problem_id[problem.id];
    }
    for (let user of contest.contestants) {
      this.valid_user_id[user.id] = true;
    }
  }

  add_submission(subs: Submission[]) {
    for (let sub of subs) {
      this.submissions.push(sub);
    }
  }

  compute() {
    let scores: {[prop: number]: Author} = {};
    for (let sub of this.submissions) {
      let a = scores[sub.user.id];
      if (!a) {
        a = scores[sub.user.id] = new Author(sub.user);
      }
      a.submissions.push(sub);
    }

    let author_scores: Author[] = [];
    for (let uid in scores) {
      let a = scores[uid];
      a.submissions.sort((a, b) => a.id - b.id);
      var p = {}; // [[0:sid, 1:pid, 2:ver, 3:run, 4:sbt, 5:lan, 6:rank]]
      for (let s of a.submissions) {
        if (!this.relevant_sub(a.user.id, s.problem.id, s.submit_time)) {
          continue;
        }
        if (!p[s.problem.id]) p[s.problem.id] = { nos: 0, ac: 0 };
        if (p[s.problem.id].ac) continue;
        if (s.verdict == 90) {
          p[s.problem.id].ac = 1;
          p[s.problem.id].sbt = s.submit_time - this.contest.start_ts;
          a.solved++;
          a.penalty += p[s.problem.id].sbt + p[s.problem.id].nos * 20 * 60;
        } else {
          p[s.problem.id].nos++;
        }
      }
      author_scores.push(a);
    }
    author_scores.sort(function solved_pen_cmp(a, b) {
      return (a.solved != b.solved)
              ? (b.solved - a.solved)
              : (a.penalty - b.penalty);
    });
  }

  relevant_sub(uid: number, pid: number, sbt: number): boolean {
    // TODO: fix
    // if (!this.contest.include_past_subs);
    if (sbt < this.contest.start_ts) return false;
    if (sbt > this.contest.end_ts) return false;
    return this.valid_user_id[uid] && this.valid_problem_id[pid];
  }
}

class Author {
  solved = 0;
  penalty = 0;
  submissions: Submission[] = [];

  constructor(public user: User) { }
}
