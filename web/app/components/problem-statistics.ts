import {Component, Input, Output,
        OnChanges, EventEmitter}      from '@angular/core';

import {Config}                       from '../config';

import {User}                         from '../models/user';
import {Problem}                      from '../models/problem';
import {Submission}                   from '../models/submission';

import {DatabaseService}              from '../services/database';
import {HttpService}                  from '../services/http';
import {ProblemService}               from '../services/problem';
import {UserService}                  from '../services/user';

import {TimerComponent}               from '../components/timer'; 

import {ProgressGraphDirective}       from '../directives/progress-graph';
import {BarGraphDirective}            from '../directives/bar-graph';

@Component({
  selector: 'uhunt-problem-statistics',
  templateUrl: 'app/components/problem-statistics.html',
  directives: [
    ProgressGraphDirective,
    BarGraphDirective,
    TimerComponent,
  ],
})
export class ProblemStatisticsComponent implements OnChanges {
  @Input() user: User;
  @Input() problem: Problem;
  @Output() hideChange = new EventEmitter();

  private submissions: Submission[] = [];
  private my_submissions: Submission[] = [];
  private ranklist: Submission[] = [];

  // For the progress graph.
  private first_sbt: number[] = [];
  private inc_amt: number[] = [];

  // For the bar graph.
  private frequencies: any = {};

  private max_last_subs: number;
  private max_rank: number;
  private show_last: string;
  private show_top: string;

  private config = Config;

  constructor(
    private _databaseService: DatabaseService,
    private _httpService: HttpService,
    private _problemService: ProblemService,
    private _userService: UserService) {

    this.max_last_subs =
      this._databaseService.get('uhunt_prob_stats_max_subs') || 5;

    this.show_last =
      this._databaseService.get('uhunt_prob_stats_show_last') || 'last';

    this.max_rank =
      this._databaseService.get('uhunt_prob_stats_max_rank') || 5;

    this.show_top =
      this._databaseService.get('uhunt_prob_stats_subs_top') || 'top';
  }

  ngOnChanges(changes) {
    // TODO: too many changes onInit.
    if (this.problem) {
      this._problemService.ready.then(() => this.refresh());
    }
  }

  private set_max_last_subs(n: number) {
    this._databaseService.set('uhunt_prob_stats_max_subs',
      this.max_last_subs = n);
    this.refresh();
  };

  private set_show_last(show) {
    this._databaseService.set('uhunt_prob_stats_show_last',
      this.show_last = show);
    this.refresh();
  };

  private set_max_rank(amt: number) {
    this._databaseService.set('uhunt_prob_stats_max_rank',
      this.max_rank = amt);
    this.refresh();
  };

  private set_show_top(show) {
    this._databaseService.set('uhunt_prob_stats_subs_top',
      this.show_top = show);
    this.refresh();
  };

  private refresh() {
    this.populate_submissions();
    this.populate_ranklist();
    this.populate_progress_graph();
    this.populate_submissions_graph();
  }

  private populate_submissions() {
    this.my_submissions = [];
    this.user.each_pid(this.problem.id, (sub) => {
      this.my_submissions.push(sub);
    });

    if (this.show_last == 'last' || this.my_submissions.length == 0) {
      this._httpService.get(Config.API_PATH + '/p/subs/'
        + this.problem.id + '/' + 0 + '/'
        + Config.now + 60 * 60 * 24 * 30 + '/'
        + this.max_last_subs)
        .then((arr) => this.update_submissions(arr));
    } else {
      this.submissions = this.my_submissions;
      this.submissions.sort(this.submit_time_cmp);
    }
  }

  private update_submissions(arr) {
    this.submissions = [];
    for (let s of arr) {
      this.submissions.push(new Submission([
        s.sid,
        new User({ userid: s.uid, username: s.uname, name: s.name }),
        this._problemService.getProblemById(s.pid),
        s.ver,
        s.lan,
        s.run,
        s.mem,
        s.rank,
        s.sbt
      ]));
    }
    this.submissions.sort(this.submit_time_cmp);
  }

  private populate_ranklist() {
    if (this.show_top == 'top' || this.my_submissions.length == 0) {
      this._httpService.get(Config.API_PATH + '/p/rank/'
        + this.problem.id + '/' + 1 + '/' + this.max_rank)
        .then((arr) => this.update_ranklist(arr));
    } else {
      var half = Math.floor((this.max_rank - 1) / 2);
      this._httpService.get(Config.API_PATH + '/p/ranklist/'
        + this.problem.id + '/' + this.user.id + '/'
        + half + '/' + (half + 1))
        .then((arr) => this.update_ranklist(arr));
    }
  }

  private update_ranklist(arr) {
    this.ranklist = [];
    for (let s of arr) {
      this.ranklist.push(new Submission([
        s.sid,
        new User({ userid: s.uid, username: s.uname, name: s.name }),
        this._problemService.getProblemById(s.pid),
        s.ver,
        s.lan,
        s.run,
        s.mem,
        s.rank,
        s.sbt
      ]));
    }
  }

  private submit_time_cmp(a: Submission, b: Submission) {
    return b.submit_time - a.submit_time;
  }

  private populate_progress_graph() {
    var sbt = Config.now, back = 50, jump = 3;
    this._httpService.get(Config.API_PATH + '/p/count/'
      + this.problem.id + '/' + sbt + '/' + back + '/' + jump)
      .then((inc_amt) => {
        if (inc_amt.length != 51) {
          console.error('Expected:' + back + ', got: ' + inc_amt.length);
        }
        this.first_sbt = [];
        this.inc_amt = inc_amt;
        var onemo = 60 * 60 * 24 * 30;
        for (var i = 0; i <= back; i++) {
          this.first_sbt.push(sbt - (back - i) * onemo * jump);
        }
      });
  }

  private populate_submissions_graph() {
    this.frequencies = {
      AC: this.problem.accepted_count,
      PE: this.problem.presentation_error_count,
      WA: this.problem.wrong_answer_count,
      TL: this.problem.time_limit_exceeded_count,
      ML: this.problem.memory_limit_exceeded_count,
      CE: this.problem.compilation_error_count,
      RE: this.problem.runtime_error_count,
      OT: this.problem.submission_error_count
      + this.problem.cannot_be_judged_count
      + this.problem.in_queue_count
      + this.problem.output_limit_exceeded_count
      + this.problem.restricted_function_count,
    };
  }
}
