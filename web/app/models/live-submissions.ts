import { Observable, Subscribable }  from 'rxjs/Observable'
import { AnonymousSubscription }     from 'rxjs/Subscription'

import { Submission }    from './submission';
import { User }          from './user';

export class LiveSubmissions {
  submissions: Submission[] = [];
  subscription: AnonymousSubscription;
  reset_first: boolean;

  subscribe(subscribable: Subscribable<Submission[]>) {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.reset_first = true;
    }
    this.subscription = subscribable.subscribe((subs) => {
      if (this.reset_first) {
        this.submissions.length = 0;
        this.reset_first = false;
      }
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
