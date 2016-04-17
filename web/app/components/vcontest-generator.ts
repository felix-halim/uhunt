import {Component, Input, Output, OnInit, OnChanges, EventEmitter} from 'angular2/core';
import {Control}              from 'angular2/common';

import {Config}               from '../config';

import {User}                 from '../models/user';
import {Problem}              from '../models/problem';
import {Submission}           from '../models/submission';

import {DatabaseService}      from '../services/database';
import {HttpService}          from '../services/http';
import {ProblemService}       from '../services/problem';
import {UserService}          from '../services/user';

import {ProblemsPickerComponent} from './problems-picker';
import {PastContestsPickerComponent} from './past-contests-picker';

@Component({
  selector: 'uhunt-vcontest-generator',
  templateUrl: 'app/components/vcontest-generator.html',
  directives: [
    ProblemsPickerComponent,
    PastContestsPickerComponent,
  ],
})
export class VcontestGenComponent implements OnChanges {
  @Input() user: User;

  // Comma separated user ids of the contestants.
  contestants: string;
  contestantsControl: Control = new Control();

  // Comma separated problem numbers in the problemset.
  problemset: string;
  problemsetControl: Control = new Control();

  // Returns true if at least one of the contestants have solved the problem id.
  issolved: (problem_id: number) => boolean;
  issolvedChanged: EventEmitter<(problem_id: number) => boolean> =
    new EventEmitter();

  contestid: number = 0;
  view_picker: string = '';
  vcontest_link: string = '';
  is_generating: boolean;
  vcontest_link_href: string;
  vcontest_gen_ta: string;
  contest_date: string;
  contest_time: string;
  duration: string;
  start_sbt: number;
  end_sbt: number;

  ubits: {[prop: number]: number[]} = {};

  private config = Config;

  constructor(
    private _databaseService: DatabaseService,
    private _httpService: HttpService,
    private _problemService: ProblemService,
    private _userService: UserService) {

    this.contestants = this._databaseService.get('uhunt_vcontest_contestants')
      || "14942, 18017, 22972, 30959, 31991, 52185, 60556, 67264, 69534, 81816";

    var d = new Date(new Date().getTime() + 1000 * 60 * 10);
    this.contest_date =
      d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
    this.contest_time = d.getHours() + ':' + d.getMinutes();
    this.duration = '5h';

    this.contestantsControl.valueChanges
      .debounceTime(1000)
      .map((uids_csv: string) => {
        var new_uids = [];
        for (let uid of this.to_numbers(uids_csv, false)) {
          if (!this.ubits.hasOwnProperty(uid)) {
            new_uids.push(uid);
          }
        }
        return new_uids;
      })
      .filter((uids: number[]) => {
        console.log('filter', uids);
        if (uids.length == 0) {
          this.update_ubits_contestants_and_issolved([]);
          return false;
        }
        return true;
      })
      .subscribe((uids: number[]) => {
        this._httpService
          .get(Config.API_PATH + '/solved-bits/' + uids.join(','))
          .then((arr) => this.update_ubits_contestants_and_issolved(arr));
      });
  }

  ngOnChanges(changes) {
    console.log(changes);
  }

  private to_numbers(str: string, return_null_on_nan) {
    var arr = [];
    if (str) {
      for (let s of str.split(',')) {
        var num = parseInt(s, 10);
        if (!isNaN(num)) {
          arr.push(num);
        } else if (return_null_on_nan) {
          return null;
        }
      }
    }
    return arr;
  }

  private update_ubits_contestants_and_issolved(solved_users) {
    for (let user of solved_users) {
      if (user.solved.length > 0) {
        this.ubits[user.uid] = user.solved;
      }
    }
    var solved = {};
    for (let uid of this.to_numbers(this.contestants, false)) {
      var s = this.ubits[uid];
      for (var j = 0; j < s.length; j++) {
        for (var k = 0; k < (1 << 5); k++) {
          var pid = (j << 5) + k;
          if ((s[j] & (1 << k))
              && this._problemService.getProblemById(pid).id) {
            solved[pid] = true;
          }
        }
      }
    }
    this.issolved = (pid) => solved.hasOwnProperty(pid);
    this.issolvedChanged.emit(this.issolved);
  }

  generate_vcontest() {
    var d = this.contest_date.split('/');
    var t = this.contest_time.split(':');
    this.start_sbt = Math.floor(
      new Date(d[0], d[1] - 1, d[2], t[0], t[1]).getTime() / 1000);
    this.end_sbt = this.start_sbt + (isNaN(dur) ? 0 : dur);

    var dur = parseInt(this.duration, 10);
    if (this.duration.indexOf('w') != -1) dur *= 7 * 24 * 60 * 60;
    else if (this.duration.indexOf('d') != -1) dur *= 24 * 60 * 60;
    else dur *= 60 * 60;

    if (dur > 30 * 24 * 60 * 60)
      return alert('Contest duration more than 1 month is not supported');

    this._databaseService.set('uhunt_vcontest_contestants', this.contestants);
    var c = {
      user_ids: this.to_numbers(this.contestants, true),
      problem_numbers: this.to_numbers(this.problemset, true),
      start_sbt: this.start_sbt,
      end_sbt: this.end_sbt,
      contest_id: this.contestid,
    };

    if (!c.user_ids || c.user_ids.length == 0 || !c.user_ids[0])
      return alert("Please double check that the contestant ids are valid.");

    if (!c.problem_numbers || c.problem_numbers.length == 0
      || !c.problem_numbers[0])
      return alert("Please double check that the problem numbers are valid.");

    this.is_generating = true;
    this.vcontest_link_href = '';
    this.vcontest_link = 'Generating virtual contest ...';
    console.log(JSON.stringify(c));

    var qs = '';
    for (let key in c) {
      if (typeof c[key] == 'object') {
        for (let value of c[key]) {
          qs += key + '=' + value + '&';
        }
      } else {
        qs += key + '=' + c[key] + '&';
      }
    }
    this._httpService.post(Config.UHUNT_HOST + '/vcontest-gen?' + qs).then(
      (res) => {
        console.log('ok = ' + res.ok);
        if (res.ok) {
          var url = Config.UHUNT_HOST + '/vcontest/' + res.id;
          this.vcontest_link_href = url;
          this.vcontest_link = url;
        } else {
          alert('Failed to generate vcontest.');
        }
        this.is_generating = false;
      });
  }
}
