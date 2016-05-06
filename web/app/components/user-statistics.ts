import {Component, Input, OnChanges} from '@angular/core';

import {Config}                      from '../config';

import {ProblemComponent}            from './problem'
import {LastSubmissionsComponent}    from './last-submissions'
import {WorldRanklistComponent}      from './world-ranklist'

import {User}                        from '../models/user';
import {Problem}                     from '../models/problem';
import {Submission, Verdict}         from '../models/submission';

import {AlgorithmistService}         from '../services/algorithmist';
import {DatabaseService}             from '../services/database';
import {ProblemService}              from '../services/problem';
import {UDebugService}               from '../services/udebug';

import {ProgressGraphDirective}      from '../directives/progress-graph';
import {BarGraphDirective}           from '../directives/bar-graph';

@Component({
  selector: 'uhunt-user-statistics',
  templateUrl: 'app/components/user-statistics.html',
  directives: [
    BarGraphDirective,
    LastSubmissionsComponent,
    ProblemComponent,
    ProgressGraphDirective,
    WorldRanklistComponent,
  ]
})
export class UserStatisticsComponent implements OnChanges {
  @Input() user: User;

  private solved_problems: Problem[] = [];
  private tried_problems: Problem[] = [];

  // For progress graph.
  private first_ac_sbt:number[] = [];
  private inc_amt:number[] = [];

  // For bar graph.
  private verdict_counts = {};

  private show_solved: string;
  private show_last_subs: boolean;

  private config = Config;

  constructor(
    private _databaseService: DatabaseService,
    private _problemService: ProblemService) {

    this.show_solved =
      this._databaseService.get('uhunt_user_statistics_show_solved') || 'less';

    this.show_last_subs =
      this._databaseService.get('uhunt_user_statistics_show_last_subs');
  }

  ngOnChanges(changes) {
    this._problemService.ready.then(() => this.refresh());
  }

  limit_solved_problems() {
    return Math.min((this.show_solved == 'less')
      ? 500 : 1e10, this.solved_problems.length);
  }

  set_show_last_subs(show) {
    this._databaseService.set('uhunt_user_statistics_show_last_subs',
      this.show_last_subs = show);
  }

  set_show_solved(show_solved) {
    this._databaseService.set('uhunt_user_statistics_show_solved',
      this.show_solved = show_solved);
  }

  refresh() {
    this.populate_solved_and_tried_problems();
    this.populate_progress_over_the_years_graph();
    this.populate_submissions_by_verdict_graph();
  }

  private populate_solved_and_tried_problems() {
    this.solved_problems = [];
    this.tried_problems = [];
    this._problemService.each((p) => {
      var st = this.user.getProblemStats(p);
      if (st.ac) {
        this.solved_problems.push(p);
      } else if (st.ntry > 0) {
        this.tried_problems.push(p);
      }
    });
    this.tried_problems.sort(this.num_cmp);
    this.solved_problems.sort(this.num_cmp);
  }

  private num_cmp(a: Problem, b: Problem) {
    return a.number - b.number;
  }

  private populate_progress_over_the_years_graph() {
    this.first_ac_sbt = [];
    this.inc_amt = [];
    this._problemService.each((p) => {
      var s = this.user.getProblemStats(p);
      if (s.ac) {
        this.first_ac_sbt.push(s.first_ac_sbt);
        this.inc_amt.push(1);
      }
    });
    this.first_ac_sbt.sort(function(a, b) { return a - b; });
  }

  private populate_submissions_by_verdict_graph() {
    var cnt = this.user.submissions_count_by_verdict();
    this.verdict_counts = {
      AC: cnt[Verdict.Accepted],
      PE: cnt[Verdict.PresentationError],
      WA: cnt[Verdict.WrongAnswer],
      TL: cnt[Verdict.TimeLimit],
      ML: cnt[Verdict.MemoryLimit],
      CE: cnt[Verdict.CompileError],
      RE: cnt[Verdict.RuntimeError],
      OT: cnt[Verdict.SubmissionError]
      + cnt[Verdict.CannotBeJudged]
      + cnt[Verdict.InQueue]
      + cnt[Verdict.RestrictedFunction]
      + cnt[Verdict.OutputLimit]
    };
  }
}
