import {Component, Input,
        OnChanges, SimpleChange,
        Pipe, PipeTransform}     from 'angular2/core';

import {BarComponent}            from './bar';
import {ProblemComponent}        from './problem';

import {Config}                  from '../config';

import {User, ProblemStatistics} from '../models/user';
import {Problem}                 from '../models/problem';
import {Submission}              from '../models/submission';

import {DatabaseService}         from '../services/database';
import {ProblemService}          from '../services/problem';

@Pipe({ name: 'filterByView' })
export class FilterByViewPipe implements PipeTransform {
  transform(values: ProblemStatistics[], [view]): ProblemStatistics[] {
    if (!values) return [];
    return values.filter(p => {
      switch (view) {
        case 0: return !p.ac;  // View Unsolved.
        case 1: return p.ac;   // View Solved.
        default: return true;  // View Both.
      }
    });
  }
}

@Pipe({ name: 'sortByColumn' })
export class SortByColumnPipe implements PipeTransform {
  transform(values: ProblemStatistics[], [column, desc]): ProblemStatistics[] {
    values.sort((a, b) => {
      let x = a.problem, y = b.problem, ret = 0;
      if (column == 'panos') {
        ret = this.compare(x.getPercentAccepted(), y.getPercentAccepted());
      }
      if (column == 'run') {
        ret = this.compare(a.mrun, b.mrun);
      }
      if (column == 'diff') {
        ret = this.compare(
          a.diff_with_best_runtime(), b.diff_with_best_runtime());
      }
      if (column == 'rank') {
        ret = this.compare(a.rank, b.rank);
      }
      ret = this.compare(x[column], y[column]);
      return desc ? -ret : ret;
    });
    return values;
  }

  compare(x, y) {
    return (x < y) ? -1 : ((x > y) ? 1 : 0);
  }
}

@Component({
  selector: 'uhunt-next-problems',
  templateUrl: 'app/components/next-problems.html',
  directives: [BarComponent, ProblemComponent],
  pipes: [FilterByViewPipe, SortByColumnPipe]
})
export class NextProblemsComponent implements OnChanges {
  @Input() user: User;

  sort_desc: boolean;
  sort_column: string;
  view_which: number;
  volume: number;
  max_next_problems: number;

  volumes: {[prop: number]: ProblemStatistics[]} = {};
  volume_all: ProblemStatistics[] = [];
  volume_bars: any[] = [];

  private config = Config;
  private math = Math;

  constructor(
    private _databaseService: DatabaseService,
    private _problemService: ProblemService) {

    this.sort_desc =
      this._databaseService.get('uhunt_next_probs_sort_desc') || true;

    this.sort_column =
      this._databaseService.get('uhunt_next_probs_sort_column')
        || 'distinct_accepted_user';

    this.view_which = // 0:unsolved, 1:solved, 2:both
      this._databaseService.get('uhunt_next_probs_view_which') || 0;

    this.volume =
      this._databaseService.get('uhunt_next_probs_volume') || 0;

    this.max_next_problems =
      this._databaseService.get('uhunt_next_probs_max') || 25;
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    this.refresh();
  }

  set_max_next_problems(n) {
    this._databaseService.set('uhunt_next_probs_max',
      this.max_next_problems = n);
  }

  set_which(idx) {
    this._databaseService.set('uhunt_next_probs_view_which',
      this.view_which = idx);
  }

  set_volume(v) {
    this._databaseService.set('uhunt_next_probs_volume', this.volume = v);
  }

  sort_next_by(sc) {
    if (this.sort_column == sc) {
      this.sort_desc = !this.sort_desc;
      this._databaseService.set('uhunt_next_probs_sort_desc', this.sort_desc);
    } else {
      this.sort_column = sc;
      this._databaseService.set('uhunt_next_probs_sort_column',
        this.sort_column);
    }
  }

  show(n) {
    this._databaseService.set('uhunt_next_probs_max',
      Math.min(100, Math.max(25, parseInt(n, 10))));
  }

  column_color(sc, i) {
    if (this.sort_column != sc) return '';
    return (i % 2)
        ? (this.sort_desc ? '#BBEEBB' : '#EEBBBB')
        : (this.sort_desc ? '#CCFFCC' : '#FFCCCC');
  }

  refresh() {
    let volume_ac_cnt = {};
    let volume_list = [];

    this.volumes = {};
    this.volume_all = [];
    this._problemService.each((p: Problem) => {
      var vol = Math.floor(p.number / 100);
      if (!this.volumes[vol]) {
        this.volumes[vol] = [];
        volume_ac_cnt[vol] = 0;
        volume_list.push(vol);
      }
      var s = this.user.getProblemStats(p);
      if (s.ac) {
        volume_ac_cnt[vol]++;
      }
      this.volumes[vol].push(s);
      this.volume_all.push(s);
    });

    volume_list.sort(function(a, b) { return a - b; });

    var vol_bars = [], sumac = 0, sumnos = 0;
    for (let v of volume_list) {
      vol_bars.push({
        index: v,
        name: 'v' + v,
        percentage: Math.floor(volume_ac_cnt[v] * 100 / this.volumes[v].length)
      });
      sumac += volume_ac_cnt[v];
      sumnos += this.volumes[v].length;
    }
    vol_bars.push({
      index: 0,
      name: 'ALL',
      percentage: Math.floor(sumac * 100 / sumnos)
    });
    this.volume_bars = vol_bars;
  }
}
