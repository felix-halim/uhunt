import { Observable,
         Subscribable }  from 'rxjs/Observable'

import { Submission }    from './submission';
import { User }          from './user';

export class LiveSubmissions {
  submissions: Submission[] = [];

  subscribe(subscribable: Subscribable<Submission[]>) {
    subscribable.subscribe((subs) => {
      for (let s of subs) {
        this.update(s);
      }
    });
  }

  private update(sub: Submission) {
    for (let i = 0; i < this.submissions.length; i++) {
      var s = this.submissions[i];
      if (s.id == sub.id) {
        this.submissions[i] = sub;
        return;
      }
      if (sub.id > s.id) {
        this.submissions.splice(i, 0, sub);
        if (this.submissions.length > 100) {
          this.submissions.pop();
        }
        return;
      }
    }
    if (this.submissions.length < 100) {
      this.submissions.push(sub);
    }
  }
}
