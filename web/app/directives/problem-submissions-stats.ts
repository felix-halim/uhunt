import {Directive, ElementRef, Input, OnInit, OnChanges} from 'angular2/core';

import {Config}          from '../config';

import {Problem}         from '../models/problem';

import {ProblemService}  from '../services/problem';

@Directive({
  selector: '[uhunt-problem-submissions-stats]',
})
export class ProblemSubmissionsStatsDirective implements OnChanges, OnInit {
  @Input('uhunt-problem-submissions-stats') problem_number: number;

  constructor(
    private _el: ElementRef,
    private _problemService: ProblemService) {}

  ngOnInit() {
    this.refresh();
  }

  ngOnChanges(changes) {
    this.refresh();
  }

  refresh() {
    this._problemService.ready.then(() => {
      var p = this._problemService.getProblemByNumber(this.problem_number);
      if (!p) return;
      this.render({
        AC: p.accepted_count,
        PE: p.presentation_error_count,
        WA: p.wrong_answer_count,
        TL: p.time_limit_exceeded_count,
        ML: p.memory_limit_exceeded_count,
        CE: p.compilation_error_count,
        RE: p.runtime_error_count,
        OT: p.submission_error_count
          + p.cannot_be_judged_count
          + p.in_queue_count
          + p.output_limit_exceeded_count
          + p.restricted_function_count,
      });
    });
  }

  render(cnt) {
    var canvas = this._el.nativeElement;
    if (!canvas.getContext) return false;
    var width = canvas.width, height = canvas.height;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#EEEEEE";
    this.rounded_rectangle(ctx, width, height, 10);

    ctx.textAlign = 'center';

    var pad = 10, gap = 3;
    var x1 = pad + 0.5, x2 = width - pad + 0.5;
    var y1 = pad + 0.5, y2 = height - pad - 8.5;
    ctx.beginPath();
    ctx.moveTo(x1, y2); ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'black';
    ctx.stroke(); // baseline

    var order = ['AC', 'PE', 'WA', 'TL', 'ML', 'CE', 'RE', 'OT'];
    var ncnt = [], maxcnt = 0, sumcnt = 0, fcolor = [];
    for (var o = 0; o < order.length; o++) {
      var code = Config.verdict_code(order[o]);
      var color = Config.verdict_color(code);
      fcolor.push(color);
      if (!cnt[order[o]]) cnt[order[o]] = 0;
      ncnt.push(cnt[order[o]]);
      maxcnt = Math.max(maxcnt, cnt[order[o]]);
      sumcnt += cnt[order[o]];
    }
    if (maxcnt == 0) {
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('No Submission Yet', width / 2, y1 + 50);
      return false;
    }

    // draw the bars
    var barsize = (x2 - x1 - pad - (gap * (order.length - 1))) / order.length;
    for (var i = 0; i < order.length; i++) {
      var x = x1 + pad / 2 + i * barsize + i * gap;
      var h = Math.ceil((ncnt[i] / maxcnt) * (y2 - y1 - 30));
      ctx.fillStyle = fcolor[i];
      ctx.strokeStyle = fcolor[i];
      ctx.fillRect(x, y2 - h - 0.5, barsize, h);
      var LO = cnt[order[i]] > 0 ? Math.log(cnt[order[i]]) : 0;
      var d = Math.ceil(LO / Math.log(10));
      var a = (barsize - d * 5) / 2;
      ctx.font = '9px sans-serif';
      ctx.fillText(cnt[order[i]], x + (barsize / 2), y2 - h - 6);
      ctx.fillText(order[i], x + (barsize / 2), y2 + 10);
    }
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Submissions Statistics', width / 2, y1 + 7);
  }

  rounded_rectangle(ctx, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.bezierCurveTo(width, 0, width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.bezierCurveTo(width, height, width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.bezierCurveTo(0, height, 0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.bezierCurveTo(0, 0, 0, 0, radius, 0);
    ctx.fill();
  }
}
