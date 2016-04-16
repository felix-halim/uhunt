import {Component, OnInit, Input,
        Output, EventEmitter}       from 'angular2/core';
import {Control}                    from 'angular2/common';

import {Problem}                    from '../models/problem';

import {DatabaseService}            from '../services/database';
import {ProblemService}             from '../services/problem';

@Component({
  selector: 'uhunt-problems-picker',
  templateUrl: 'app/components/problems-picker.html',
})
export class ProblemsPickerComponent implements OnInit {

  // List of problem numbers in the problemset.
  @Input() problemset: string;
  @Output() problemsetChange: EventEmitter<string> = new EventEmitter();

  @Input() problemsetControl: Control;

  // Returns true if at least one of the contestants have solved the problem id.
  @Input() issolved: (problem_id: number) => boolean;
  @Input() issolvedChanged: EventEmitter<(problem_id: number) => boolean>;

  problems_at_level: Problem[][] = [];

  levels: Problem[][];
  all_levels: Problem[][];

  show_unsolved: boolean;
  difficulty: number;
  selected = {};

  constructor(
    private _databaseService: DatabaseService,
    private _problemService: ProblemService) {

    // Pick 7 random numbers (type 1 = easy, 2 = medium, 3 = uniform).
    this.difficulty =
      this._databaseService.get('uhunt_picker_difficulty') || 2;

    this.show_unsolved =
      this._databaseService.get('uhunt_picker_show_unsolved') || true;
  }

  ngOnInit() {
    this._problemService.ready.then(() => {
      this._problemService.each(p => {
        var lev = p.getLevel() - 1;
        if (!this.problems_at_level[lev]) this.problems_at_level[lev] = [];
        this.problems_at_level[lev].push(p);
      });

      this.refresh(this.issolved);

      this.issolvedChanged.subscribe(f => {
        this.refresh(f);
      });

      this.problemsetControl.valueChanges
        .debounceTime(200)
        .subscribe((x: string) => {
          var arr = this.to_numbers(x);
          if (arr) this.update_problemsets(arr);
        });
    });
  }

  set_difficulty(type) {
    this._databaseService.set('uhunt_picker_difficulty',
      this.difficulty = type);
    this.pick_n(7);
  }

  set_show_unsolved(show) {
    this._databaseService.set('uhunt_picker_show_unsolved',
      this.show_unsolved = show);
    this.pick_n(7);
  }

  private refresh(is_solved) {
    if (!is_solved) return;
    console.log('refresh', is_solved);
    this.levels = [];
    this.all_levels = [];
    for (let lev in this.problems_at_level) {
      var ps = this.problems_at_level[lev];
      for (let p of ps) {
        if (!this.show_unsolved || !is_solved(p.id)) {
          if (!this.levels[lev]) this.levels[lev] = [];
          this.levels[lev].push(p);
        }
        if (!this.all_levels[lev]) this.all_levels[lev] = [];
        this.all_levels[lev].push(p);
      }
    }
    if (this.problemset && this.problemset.length > 0) {
      var arr = this.to_numbers(this.problemset);
      this.update_problemsets(arr);
    } else {
      this.pick_n(7);
    }
  }

  private pick_n(n) {
    var per_level_pick = (this.difficulty == 1)
                   ? n : (this.difficulty == 2) ? 2 : 1;
    var arr = [];
    for (let problems of this.show_unsolved ? this.levels : this.all_levels) {
      var random_samples = [];
      for (let i in problems) {
        if (random_samples.length < per_level_pick) {
          random_samples.push(problems[i]);
        } else {
          let r = Math.floor(Math.random() * (parseInt(i, 10) + 1));
          if (r < per_level_pick) {
            random_samples[r] = problems[i];
          }
        }
      }
      for (let p of random_samples) {
        if (arr.length < n) {
          arr.push(p.number);
        }
      }
      if (arr.length >= n) break;
    }
    this.update_problemsets(arr);
  }

  toggle_problem($event) {
    var num = parseInt($event.target.innerHTML, 10);
    var arr = this.to_numbers(this.problemset);
    var idx = arr.indexOf(num);
    if (idx != -1) {
      arr.splice(idx, 1);
    } else {
      arr.push(num);
    }
    this.update_problemsets(arr);
  }

  n_selected() {
    var arr = this.to_numbers(this.problemset || '');
    return arr == null ? '?' : arr.length;
  }

  private update_problemsets(arr) {
    this.selected = {};
    for (var i = 0; i < arr.length; i++) {
      this.selected[arr[i]] = true;
    }
    this.problemset = arr.join(', ');
    this.problemsetChange.emit(this.problemset);
    console.log('changed', this.problemset);
  }

  private to_numbers(str: string) {
    var arr = [];
    for (let s of str.split(',')) {
      var num = parseInt(s, 10);
      if (isNaN(num)) {
        return null;
      }
      arr.push(num);
    }
    return arr;
  }
}
