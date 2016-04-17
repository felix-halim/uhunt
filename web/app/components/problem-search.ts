import {Component, Input, OnChanges} from 'angular2/core';

import {Config}               from '../config';

import {User}                 from '../models/user';
import {Problem}              from '../models/problem';
import {Submission}           from '../models/submission';

import {DatabaseService}      from '../services/database';
import {HttpService}          from '../services/http';
import {ProblemService}       from '../services/problem';
import {UserService}          from '../services/user';

import {ElapsedTimePipe}      from '../pipes/elapsed-time';

import {ProgressGraphDirective}  from '../directives/progress-graph';
import {BarGraphDirective}       from '../directives/bar-graph';

@Component({
  selector: 'uhunt-problem-search',
  templateUrl: 'app/components/problem-search.html',
  directives: [
    ProgressGraphDirective,
    BarGraphDirective,
  ],
  pipes: [ElapsedTimePipe]
})
export class ProblemSearchComponent implements OnChanges {
  @Input() user: User;

  private search_number: string;
  private searched_problem: Problem;
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
  private show_search_result: boolean;
  private show_top: string;

  private config = Config;

  constructor(
    private _databaseService: DatabaseService,
    private _httpService: HttpService,
    private _problemService: ProblemService,
    private _userService: UserService) {

    this.search_number =
      this._databaseService.get('uhunt_prob_search_number') || '';

    this.show_search_result =
      this._databaseService.get('uhunt_prob_show_search_result') || false;

    this.max_last_subs =
      this._databaseService.get('uhunt_prob_search_max_subs') || 5;

    this.show_last =
      this._databaseService.get('uhunt_prob_search_show_last') || 'last';

    this.max_rank =
      this._databaseService.get('uhunt_prob_search_max_rank') || 5;

    this.show_top =
      this._databaseService.get('uhunt_prob_search_subs_top') || 'top';
  }

  ngOnChanges(changes) {
    if (this.show_search_result) {
      this._problemService.ready.then(() => this.search());
    }
  }

  private set_show_search_result(show: boolean) {
    this._databaseService.set('uhunt_prob_show_search_result',
      this.show_search_result = show);
  }

  private set_max_last_subs(n: number) {
    this._databaseService.set('uhunt_prob_search_max_subs',
      this.max_last_subs = n);
    this.search();
  };

  private set_show_last(show) {
    this._databaseService.set('uhunt_prob_search_show_last',
      this.show_last = show);
    this.search();
  };

  private set_max_rank(amt: number) {
    this._databaseService.set('uhunt_prob_search_max_rank',
      this.max_rank = amt);
    this.search();
  };

  private set_show_top(show) {
    this._databaseService.set('uhunt_prob_search_subs_top',
      this.show_top = show);
    this.search();
  };

  private search() {
    this._databaseService.set('uhunt_prob_search_number', this.search_number);

    var num = parseInt(this.search_number, 10);
    this.searched_problem = this._problemService.getProblemByNumber(num);

    if (!this.searched_problem.id) {
      return this.set_show_search_result(false);
    }

    this.populate_submissions();
    this.populate_ranklist();
    this.populate_progress_graph();
    this.populate_submissions_graph();
    this.set_show_search_result(true);
  }

  private populate_submissions() {
    this.my_submissions = [];
    this.user.each_pid(this.searched_problem.id, (sub) => {
      this.my_submissions.push(sub);
    });

    if (this.show_last == 'last' || this.my_submissions.length == 0) {
      this._httpService.get(Config.API_PATH + '/p/subs/'
        + this.searched_problem.id + '/' + 0 + '/'
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
        + this.searched_problem.id + '/' + 1 + '/' + this.max_rank)
        .then((arr) => this.update_ranklist(arr));
    } else {
      var half = Math.floor((this.max_rank - 1) / 2);
      this._httpService.get(Config.API_PATH + '/p/ranklist/'
        + this.searched_problem.id + '/' + this.user.id + '/'
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
      + this.searched_problem.id + '/' + sbt + '/' + back + '/' + jump)
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
      AC: this.searched_problem.accepted_count,
      PE: this.searched_problem.presentation_error_count,
      WA: this.searched_problem.wrong_answer_count,
      TL: this.searched_problem.time_limit_exceeded_count,
      ML: this.searched_problem.memory_limit_exceeded_count,
      CE: this.searched_problem.compilation_error_count,
      RE: this.searched_problem.runtime_error_count,
      OT: this.searched_problem.submission_error_count
      + this.searched_problem.cannot_be_judged_count
      + this.searched_problem.in_queue_count
      + this.searched_problem.output_limit_exceeded_count
      + this.searched_problem.restricted_function_count,
    };
  }
}
