import {Component, OnInit, Input,
        Output, EventEmitter}       from 'angular2/core';
import {Control}                    from 'angular2/common';

import {Config}                     from '../config';

import {Problem}                    from '../models/problem';

import {DatabaseService}            from '../services/database';
import {HttpService}                from '../services/http';
import {ProblemService}             from '../services/problem';

@Component({
  selector: 'uhunt-past-contests-picker',
  templateUrl: 'app/components/past-contests-picker.html',
})
export class PastContestsPickerComponent implements OnInit {
  // List of problem numbers in the problemset.
  @Input() problemset: string;
  @Output() problemsetChange: EventEmitter<string> = new EventEmitter();

  // Returns true if at least one of the contestants have solved the problem id.
  @Input() issolved: (problem_id: number) => boolean;
  @Input() issolvedChanged: EventEmitter<(problem_id: number) => boolean>;

  @Input() contestid: number = 0;
  @Output() contestidChange: EventEmitter<number> = new EventEmitter();

  contests: any[] = [];
  arr: any[] = [];
  sort_by: string;
  sort_asc: boolean;
  show: number:
  view: string;

  constructor(
    private _databaseService: DatabaseService,
    private _httpService: HttpService,
    private _problemService: ProblemService) {

    this.sort_by =
      this._databaseService.get('uhunt_past_contest_sort_by') || 'dacu';

    this.sort_asc =
      this._databaseService.get('uhunt_past_contest_sort_asc');

    this.view =
      this._databaseService.get('uhunt_past_contest_view') || 'unsolved';

    this.show =
      this._databaseService.get('uhunt_past_contest_show') || 25;
  }

  ngOnInit() {
    Promise.all([
      this._httpService.get(Config.API_PATH + '/contests'),
      this._problemService.ready
    ]).then((res) => {
      if (res[0]) {
        console.log('Loaded contests: ' + res[0].length);
        this.contests = res[0];
      }
      this.refresh(this.issolved);
      this.issolvedChanged.subscribe(f => {
        this.refresh(f);
      });
    });
  }

  set_contest_id(c) {
    this.contestid = c.id;
    this.contestidChange.emit(this.contestid);
    this.problemset = c.problems.join(', ');
    this.problemsetChange.emit(this.problemset);
  }

  set_view(view) {
    this._databaseService.set('uhunt_past_contest_view', this.view = view);
  };

  set_show(show) {
    this._databaseService.set('uhunt_past_contest_show', this.show = show);
  };

  set_sort_by(by) {
    if (this.sort_by == by) {
      this.sort_asc = !this.sort_asc;
      this._databaseService.set('uhunt_past_contest_sort_asc', this.sort_asc);
    }
    this._databaseService.set('uhunt_past_contest_sort_by', this.sort_by = by);
    this.sort_it();
  }

  refresh(is_solved) {
    if (!is_solved) return;
    console.log('refresh', is_solved);
    this.arr = [];
    for (var j = 0; j < this.contests.length; j++) {
      var c = this.contests[j];
      c.duration = Math.ceil((c.endtime - c.starttime) / 60 / 60);
      c.dacu = c.solved = 0;
      for (let problem_number of c.problems) {
        var p = this._problemService.getProblemByNumber(problem_number);
        if (p) {
          if (is_solved(p.id)) {
            c.solved++;
          } else {
            c.dacu += p.distinct_accepted_user;
          }
        }
      }
      this.arr.push(c);
    }
    this.sort_it();
  }

  sort_it() {
    var cmp = this.sort_cmp[this.sort_by];
    if (this.sort_asc) {
      this.arr.sort(cmp);
    } else {
      this.arr.sort(function(a, b) { return -cmp(a, b); });
    }
  }

  color(i) {
    return (i % 2)
      ? (this.sort_asc ? '#EEBBBB' : '#BBEEBB')
      : (this.sort_asc ? '#FFCCCC' : '#CCFFCC');
  }

  private sort_cmp = {
    "id": function(a, b) { return a.id - b.id },
    "title": function(a, b) {
      return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    },
    "solved": function(a, b) { return a.solved - b.solved; },
    "dacu": function(a, b) { return a.dacu - b.dacu; },
    "nprobs": function(a, b) { return a.problems.length - b.problems.length; },
    "duration": function(a, b) { return a.duration - b.duration; },
  };
}
