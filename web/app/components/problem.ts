import {Component, Input}        from 'angular2/core';
import {Control}                 from 'angular2/common';

import {Config}                  from '../config';

import {Problem}                 from '../models/problem';
import {User}                    from '../models/user';

import {AlgorithmistService}     from '../services/algorithmist';
import {CpBookExercisesService}  from '../services/cp-book-exercises';
import {DatabaseService}         from '../services/database';
import {ProblemService}          from '../services/problem';
import {UDebugService}           from '../services/udebug';

@Component({
  selector: 'uhunt-problem',
  template:
`<span style="float:right; padding-right:5px;">
    <span *ngIf="_cpbookService.is_starred(problem.number)"
          style="line-height:0.5">&#9733;</span>
    <a *ngIf="_algorithmistService.exists(problem.number)"
       class="nou" target="_blank" style="margin-left:3px"
       href="{{config.algorithmist_link(problem)}}">&pi;</a>
    <a *ngIf="_uDebugService.exists(problem.number)"
       class="nou" target="_blank" style="margin-left:3px"
       href="{{config.udebug_link(problem)}}">
      <img src="/images/udebug3.png">
    </a>
    <a class="nou" target="_blank" style="margin-left:3px"
      href="{{config.problem_discussion_link(problem)}}">
      <img src="/images/q.gif">
    </a>
  </span>
  <a class="ellipsis" href="{{config.problem_full_link(problem)}}"
     style="margin-left:5px; color:black; width:{{name_width()}}px;"
     target="_blank">{{problem.title}}</a>`,
})
export class ProblemComponent {
  @Input() problem: Problem;
  @Input() width: number;

  private config = Config;

  constructor(
    private _algorithmistService: AlgorithmistService,
    private _cpbookService: CpBookExercisesService,
    private _databaseService: DatabaseService,
    private _problemService: ProblemService,
    private _uDebugService: UDebugService) {}

  name_width() {
    var has_item = 0;
    var width = this.width;
    if (this._cpbookService.is_starred(this.problem.number)) {
      width -= 10;
      has_item = 1;
    }
    if (this._algorithmistService.exists(this.problem.number)) {
      width -= has_item * 6;
      width -= 17;
      has_item = 1;
    }
    if (this._uDebugService.exists(this.problem.number)) {
      width -= has_item * 6;
      width -= 18;
      has_item = 1;
    }
    width -= has_item * 6;
    width -= 30;
    return width;
  }
}
