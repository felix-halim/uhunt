import {Component, Input, OnChanges} from '@angular/core';

import {Config}                  from '../config';

import {BarComponent}            from '../components/bar';
import {ProblemComponent}        from '../components/problem';

import {User}                    from '../models/user';

import {CpBookExercisesService}  from '../services/cp-book-exercises';
import {DatabaseService}         from '../services/database';
import {ProblemService}          from '../services/problem';

@Component({
  selector: 'uhunt-cp-book-exercises',
  templateUrl: 'app/components/cp-book-exercises.html',
  directives: [BarComponent, ProblemComponent]
})
export class CpBookExercisesComponent implements OnChanges {
  @Input() user: User;

  private chapter: number;
  private show: string;
  private sections: any;

  private config = Config;
  private cpbooks = CpBookExercisesService._cpbooks;

  constructor(
    private _cpBookService: CpBookExercisesService,
    private _databaseService: DatabaseService,
    private _problemService: ProblemService) {

    this.show = this._databaseService.get('uhunt_cp_book_show') || 'Starred';
    this.chapter = this._databaseService.get('uhunt_cp_book_chapter') || -1;
  }

  ngOnChanges(changes) {
    this.refresh();
  }

  set_chapter(chapter, type) {
    this._databaseService.set('uhunt_cp_book_show', this.show = type);

    this._databaseService.set('uhunt_cp_book_chapter',
      this.chapter = (this.chapter === chapter && !type) ? -1 : chapter);

    this.refresh();
  }

  is_selected_and(type, index) {
    return this.chapter == index && this.show == type;
  }

  not_is_selected_and(type, index) {
    return !this.is_selected_and(type, index);
  }

  switch_edition(edition) {
    this._cpBookService.set_edition(edition);
    this.refresh();
  }

  percentage(c, show) {
    var solved = 0, total = 0;
    for (var i = 0; i < c.arr.length; i++) {
      var sc = c.arr[i];
      for (var j = 0; j < sc.arr.length; j++) {
        var ssc = sc.arr[j];
        for (var k = 1; k < ssc.length; k++) {
          if (show == 'Starred' && ssc[k] > 0) continue;
          var p = this._problemService.getProblemByNumber(Math.abs(ssc[k]));
          if (!p.id) continue;
          if (this.user.getProblemStats(p).ac) solved++;
          total++;
        }
      }
    }
    return Math.floor(solved * 100 / total);
  }

  private refresh() {
    this._problemService.ready.then(() => {
      if (this.chapter < 0) return;
      var c = this.cpbooks[this._cpBookService.edition].chapters[this.chapter];
      if (!c) return;
      var sections = [];
      for (var i = 0, LN = 0, RN = 0; i < c.arr.length; i++) {
        var sc = c.arr[i], nsolved = 0, ntotal = 0, nhead = 0, s = [];
        for (var j = 0; j < sc.arr.length; j++) {
          var ssc = sc.arr[j], ss = [], sub_solved = 0, sub_total = 0; nhead++;
          for (var k = 1; k < ssc.length; k++) {
            if (this.show == 'Starred' && ssc[k] > 0) continue;
            var p = this._problemService.getProblemByNumber(Math.abs(ssc[k]));
            if (!p.id) continue;
            var st = this.user.getProblemStats(p);
            if (st.ac) {
              nsolved++;
              sub_solved++;
            }
            ss.push({
              p: p,
              st: st,
              starred: ssc[k] < 0,
              level: 10 - Math.floor(Math.min(10, Math.log(
                p.distinct_accepted_user ? p.distinct_accepted_user : 1)))
            });
            ntotal++;
            sub_total++;
          }
          s.push({
            title: ssc[0],
            solved: sub_solved,
            total: sub_total,
            sections: ss,
          });
        }
        sections.push({
          float: LN <= RN ? 'left' : 'right',
          section_title: sc.title,
          solved: nsolved,
          total: ntotal,
          percent_ac: Math.floor(nsolved / ntotal * 100) + '%',
          sections: s,
        });
        ntotal += nhead;
        if (LN <= RN) LN += ntotal; else RN += ntotal;
      }
      this.sections = sections;
    });
  }
}
