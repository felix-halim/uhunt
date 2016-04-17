import {Component, Input, OnChanges} from 'angular2/core';
import {Observable}       from 'rxjs/Observable';
import {Observer}         from 'rxjs/Observer';

import {CpBookExercisesComponent}    from './cp-book-exercises'
import {Config}                      from '../config';

import {User}                        from '../models/user';
import {Problem}                     from '../models/problem';

import {DatabaseService}             from '../services/database';
import {HttpService}                 from '../services/http';
import {ProblemService}              from '../services/problem';

@Component({
  selector: 'uhunt-statistics-comparer',
  templateUrl: 'app/components/statistics-comparer.html',
})
export class StatsComparerComponent implements OnChanges {
  @Input() user: User;

  input_expr: string = '';
  cmp_expr: string;
  pos: number;
  error_parsing: boolean;
  look: any;
  result: number[] = [];
  problems: Problem[] = [];
  cmp_users = {};
  cur_users = {};
  unames_gathering: boolean;

  private config = Config;

  constructor(
    private _databaseService: DatabaseService,
    private _problemService: ProblemService,
    private _httpService: HttpService) {

    this._problemService.subscribe(() => this.refresh());
  }

  ngOnChanges(changes) {
    this.refresh();
  }

  private refresh() {
    var S = [];
    var CP1 = [];
    var CP1S = [];
    var CP2 = [];
    var CP2S = [];
    var CP3 = [];
    var CP3S = [];

    this._problemService.each((p) => { S.push(p.number); });
    S.sort(this.intcmp);
    this.cmp_users['S'] = S;

    for (let num of CpBookExercisesComponent.get_cp_numbers(0)) {
      CP1.push(Math.abs(num));
      if (num < 0) CP1S.push(-num);
    }
    for (var num of CpBookExercisesComponent.get_cp_numbers(1)) {
      CP2.push(Math.abs(num));
      if (num < 0) CP2S.push(-num);
    }
    for (let num of CpBookExercisesComponent.get_cp_numbers(2)) {
      CP3.push(Math.abs(num));
      if (num < 0) CP3S.push(-num);
    }
    this.cmp_users['cp1'] = this.unique(CP1);
    this.cmp_users['cp1s'] = this.unique(CP1S);
    this.cmp_users['cp2'] = this.unique(CP2);
    this.cmp_users['cp2s'] = this.unique(CP2S);
    this.cmp_users['cp3'] = this.unique(CP3);
    this.cmp_users['cp3s'] = this.unique(CP3S);

    this.cmp_expr = this.input_expr =
      this._databaseService.get('uhunt_statscmp_expr')
        || ('felix_halim - ' + this.user.username);
  }

  private unique(arr) {
    arr.sort(this.intcmp);
    for (var i = 0, j = 1; j < arr.length; j++) {
      if (arr[i] != arr[j]) {
        i++;
        if (i != j) arr[i] = arr[j];
      }
    }
    arr.length = i + 1;
    return arr;
  }

  private intcmp(a, b) { return a - b; }

  private intersect(x, y): any {
    if (this.unames_gathering) return false;
    var xi = 0, yi = 0, ret = [];
    while (xi < x.length && yi < y.length) {
      if (this.intcmp(x[xi], y[yi]) < 0) xi++;
      else if (this.intcmp(x[xi], y[yi]) > 0) yi++;
      else { ret.push(y[yi++]); xi++; }
    }
    return ret;
  }

  private union(x, y): any {
    if (this.unames_gathering) return false;
    var xi = 0, yi = 0, ret = [];
    while (xi < x.length && yi < y.length) {
      if (this.intcmp(x[xi], y[yi]) < 0) ret.push(x[xi++]);
      else if (this.intcmp(x[xi], y[yi]) > 0) ret.push(y[yi++]);
      else { ret.push(y[yi++]); xi++; }
    }
    while (xi < x.length) ret.push(x[xi++]);
    while (yi < y.length) ret.push(y[yi++]);
    return ret;
  }

  private subtract(x, y): any {
    if (this.unames_gathering) return false;
    var xi = 0, yi = 0, ret = [];
    while (xi < x.length && yi < y.length) {
      if (this.intcmp(x[xi], y[yi]) < 0) ret.push(x[xi++]);
      else if (this.intcmp(x[xi], y[yi]) > 0) yi++;
      else { xi++; yi++; }
    }
    while (xi < x.length) ret.push(x[xi++]);
    return ret;
  }

  private next_token(): any {
    if (this.error_parsing) return 0;
    if (this.pos >= this.input_expr.length) return this.look = -1;
    var token = this.input_expr.charAt(this.pos++);
    while (token == ' ' && this.pos < this.input_expr.length) {
      token = this.input_expr.charAt(this.pos++);
    }
    var c = token;
    while (c != '&' && c != '-' && c != '+' && c != '(' && c != ')'
           && this.pos < this.input_expr.length) {
      c = this.input_expr.charAt(this.pos++);
      if (c != '&' && c != '-' && c != '+' && c != '(' && c != ')') {
        token += c;
      } else {
        this.pos--;
        break;
      }
    }
    return this.look = token.trim();
  }

  private match(x) {
    if (this.error_parsing) return 0;
    if (x != this.look) this.error_parsing = true;
    this.next_token();
  }

  private eval_var(v) {
    if (this.unames_gathering) {
      if (typeof this.cmp_users[v] == 'undefined') {
        this.cmp_users[v] = 'unset';
      }
      this.cur_users[v] = 'new';
    }
    this.match(v);
    return this.cmp_users[v];
  }

  private bracket() {
    if (this.error_parsing) return 0;
    if (this.look == '(') {
      this.match('(');
      var res = this.term();
      this.match(')');
      return res;
    }
    return this.eval_var(this.look);
  }

  private term() {
    if (this.error_parsing) return 0;
    var ret = this.bracket();
    while (!this.error_parsing && this.look != -1) {
      if (this.look == '&') {
        this.match('&');
        ret = this.intersect(ret, this.bracket());
      } else if (this.look == '+') {
        this.match('+');
        ret = this.union(ret, this.bracket());
      } else if (this.look == '-') {
        this.match('-');
        ret = this.subtract(ret, this.bracket());
      } else if (this.look == ')') {
        break;
      } else {
        this.error_parsing = true;
      }
    }
    return ret;
  }

  private parse() {
    this.pos = 0;
    this.error_parsing = false;
    this.look = this.next_token();
    this.cur_users = {};
    this.result = this.term();
    if (this.look != -1) this.error_parsing = true;
    return !this.error_parsing;
  }

  private clear() {
    this.cur_users = {};
    this.cmp_users = {};
    this.cmp_expr = '';
    this.refresh();
  }

  execute_cmp_expr() {
    if (this.cmp_expr.length == 0) {
      this.result = [];
      return;
    }

    this._databaseService.set('uhunt_statscmp_expr', this.cmp_expr);
    this.input_expr = this.cmp_expr; //.toLowerCase();
    this.unames_gathering = true;
    if (!this.parse()) {
      this.unames_gathering = false;
    } else {
      var unames = [];
      for (var uname in this.cur_users)
        if (this.cmp_users[uname] == 'unset')
          unames.push(uname);

      this.fetch(unames).then(() => {
        this.unames_gathering = false;
        this.parse();
        this.problems = [];
        for (let num of this.result) {
          var p = this._problemService.getProblemByNumber(num);
          if (p.id) {
            this.problems.push(p);
          }
        }
      });
    }
  };

  private fetch(unames) {
    return this._httpService.get(Config.API_PATH + '/solved-bits',
        { unames: JSON.stringify(unames) })
      .then(res => {
        var invalids = '';
        for (var i = 0; i < res.length; i++) {
          if (res[i].solved === false) {
            invalids += res[i].username + "\n";
          } else {
            var s = res[i].solved, arr = [];
            for (var j = 0; j < s.length; j++) {
              for (var k = 0; k < (1 << 5); k++) {
                var p = this._problemService.getProblemById((j << 5) + k);
                if ((s[j] & (1 << k)) && p.id) arr.push(p.number);
              }
            }
            arr.sort(this.intcmp);
            this.cmp_users[res[i].username] = arr;
          }
        }
        if (invalids.length > 0) alert("Invalid username(s) :\n" + invalids);
      });
  }

  colored_terms() {
    var res = [], t = '';
    for (var i = 0; i < this.input_expr.length; i++) {
      var c = this.input_expr.charAt(i)
      if (c != '&' && c != '-' && c != '+' && c != '(' && c != ')') t += c;
      else {
        res.push([t, c]);
        t = '';
      }
    }
    if (t != '') res.push([t, '']);
    return res;
  }
}
