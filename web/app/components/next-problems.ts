import {Component, Input, OnChanges, SimpleChange} from 'angular2/core';

import {BarComponent}            from './bar';

import {Config}                  from '../config';

import {User, ProblemStatistics} from '../models/user';
import {Problem}                 from '../models/problem';
import {Submission}              from '../models/submission';

import {DatabaseService}         from '../services/database';
import {HttpService}             from '../services/http';
import {ProblemService}          from '../services/problem';
import {UserService}             from '../services/user';

import {ElapsedTimePipe}         from '../pipes/elapsed-time';

@Component({
  selector: 'uhunt-next-problems',
  templateUrl: 'app/components/next-problems.html',
  directives: [
    BarComponent,
  ],
  pipes: [ElapsedTimePipe]
})
export class NextProblemsComponent implements OnChanges {
  @Input() user: User;

  sort_desc: boolean;
  sort_column: string;
  view_which: number;
  volume: number;
  max_next_problems: number;
  volume_name: string;
  colspan: number;

  volumes: {[prop: number]: ProblemStatistics[]} = {};
  volume_all: ProblemStatistics[] = [];
  volume_bars: any[];
  next_problems: any[];

  private config = Config;

  constructor(
    private _databaseService: DatabaseService,
    private _httpService: HttpService,
    private _problemService: ProblemService,
    private _userService: UserService) {

    this.sort_desc = this._databaseService.get('sort_desc') || true;
    this.sort_column =
      this._databaseService.get('sort_column') || 'distinct_accepted_user';
    this.view_which = this._databaseService.get('np_view_which') || 0; // 0:unsolved, 1:solved, 2:both
    this.volume = this._databaseService.get('selected_volume') || 0;

    // if (view_which == 0) $('#npv_unsolved').css('color', 'lightgreen');
    // else if (view_which == 1) $('#npv_solved').css('color', 'lightgreen');
    // else $('#npv_both').css('color', 'lightgreen');

    this.max_next_problems = this._databaseService.get('show_next_problems') || 25;
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    this.refresh();
  }

  set_max_next_problems(n) {
    this._databaseService.set('show_next_problems', this.max_next_problems = n);
  }

  next_comparator(a: ProblemStatistics, b: ProblemStatistics) {
    let x = a.problem, y = b.problem;
    return this.sort_column == 'panos'
      ? this.compare(x.getPercentAccepted(), y.getPercentAccepted())
      : this.compare(x[this.sort_column], y[this.sort_column]);
  }

  compare(x, y) {
    var c = (x < y) ? -1 : ((x > y) ? 1 : 0);
    return this.sort_desc ? -c : c;
  }

  set_which(idx) {
    this._databaseService.set('np_view_which', this.view_which = idx);
    this.show_table(undefined);
  }

  sort_next_by(sc) {
    if (this.sort_column == sc) {
      this.sort_desc = !this.sort_desc;
      this._databaseService.set('sort_desc', this.sort_desc);
    } else {
      this.sort_column = sc;
      this._databaseService.set('sort_column', this.sort_column);
    }
    this.show_table(undefined);
  };

  show(n) {
    n = Math.min(100, Math.max(25, parseInt(n, 10)));
    this._databaseService.set('show_next_problems', n);
    this.show_table(undefined);
  }

  column_color(sc, i) {
    if (this.sort_column != sc) return '';
    return (i % 2)
        ? (this.sort_desc ? '#BBEEBB' : '#EEBBBB')
        : (this.sort_desc ? '#CCFFCC' : '#FFCCCC');
  }

  show_table(v) {
    if (v === undefined) v = this.volume;
    this._databaseService.set('selected_volume', v);
    this.volume = v;
    this.volume_name = v == 0 ? 'ALL' : ('v' + v);
    this.colspan = (this.view_which == 0) ? 8 : 11;
    var vids = (v == 0) ? this.volume_all : this.volumes[v];
    if (!vids) return this.next_problems = [];
    var cands = [];
    for (let p of vids) {
      if (this.view_which == 0) {
        if (!p.ac) cands.push(p);
      } else if (this.view_which == 1) {
        if (p.ac) cands.push(p);
      } else {
        cands.push(p);
      }
    }
    cands.sort((a, b) => this.next_comparator(a, b));
    this.next_problems = cands;
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

    this.show_table(undefined);

    // var sel_vol = this._databaseService.get('selected_volume');
    // $('.vol_row_'+sel_vol).each(function(i,a){ if (a.getAttribute) show_table(a); });

    // $.render_runtime = function(){
    //   submissions.ac_pids.sort(function(a,b){ // sort by decreasing runtime difference
    //     var da = submissions.min_runtime[problems.pid_key[a][0]] - problems.pid_key[a][4];
    //     var db = submissions.min_runtime[problems.pid_key[b][0]] - problems.pid_key[b][4];
    //     return db - da;
    //   });

    //   var s = '';
    //   for (var i=0; i<submissions.ac_pids.length && i<25; i++){
    //     var pid = submissions.ac_pids[i],
    //       p = problems.pid_key[pid],
    //       b = submissions.min_runtime[pid];
    //     s += '<tr><td>' + (i+1) +
    //       '<td>' + $.pid_link(p[0],p[1]) +
    //       '<td><span style="float:right">' + $.discuss(p[1]) + '</span>' + $.problem_a(p,200) +
    //       '<td>' + tpl.format_ms(b) +
    //       '<td>' + tpl.format_ms(p[4]) +
    //       '<td>' + tpl.format_ms(b-p[4]);
    //   }
    //   $('#runtime_tbody').html(s);
    // }
    // $.render_runtime();
  }
}
