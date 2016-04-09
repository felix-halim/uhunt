import {Directive, ElementRef, Input, OnInit, OnChanges} from 'angular2/core';

import {Config}               from '../config';

import {HttpService}          from '../services/http';
import {ProblemService}       from '../services/problem';

@Directive({
  selector: '[uhunt-problem-progress-stats]',
})
export class ProblemProgressStatsDirective implements OnChanges, OnInit {
  @Input('uhunt-problem-progress-stats') problem_number: number;

  constructor(
    private _el: ElementRef,
    private _problemService: ProblemService,
    private _httpService: HttpService) {
  }

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

      var sbt = Config.now, back = 50, jump = 3;
      this._httpService.get(Config.API_PATH
        + '/p/count/' + p.id + '/' + sbt + '/' + back + '/' + jump)
        .then((inc_amt) => {
          if (inc_amt.length != 51) {
            console.error('Expected:' + back + ', got: ' + inc_amt.length);
          }
          var first_sbt = [], onemo = 60 * 60 * 24 * 30;
          for (var i = 0; i <= back; i++) {
            first_sbt.push(sbt - (back - i) * onemo * jump);
          }
          this.render('Submissions over the Years', first_sbt, inc_amt);
        });
    });
  }

  render(title, first_sbt, inc_amt) {
    var canvas = this._el.nativeElement;
    if (!canvas.getContext) return false;
    var width = canvas.width, height = canvas.height;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#EEEEEE";
    this.rounded_rectangle(ctx, width, height, 10);

    var x1 = 15.5, x2 = width - 37, y1 = 30.5, y2 = height - 18.5;
    ctx.textAlign = 'center';
    var len = 0;
    for (var i = 0; i < inc_amt.length; i++) len += inc_amt[i];
    if (len == 0) {
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("No Progress Yet", x1 + 30, y1 + 60);
      return false;
    }

    var start = first_sbt[0], end = Config.now;
    var ylen = y2 - y1, ygap = ylen / len;
    var xlen = x2 - x1, tlen = Math.max(1, end - start);

    // Year Grid
    ctx.font = "10px sans-serif";
    ctx.fillStyle = "black";
    ctx.beginPath();
    for (var Y = new Date().getFullYear(), i = 0; i < 100; i++ , Y--) {
      let time = Math.floor(new Date(Y, 0, 1, 1, 1, 1, 1).getTime() / 1000);
      if (start <= time && time <= end) {
        var x = x1 + ((time - start) / tlen) * xlen;
        x = Math.floor(x) + 0.5;
        ctx.moveTo(x, y1); ctx.lineTo(x, y2);
        ctx.moveTo(x, y1); ctx.lineTo(x, y2);
        var year = Y % 100;
        if (year < 10) year = '0' + year;
        ctx.fillText(year, x - 1, y2 + 11, 20);
      } else if (time < start) break;
    }
    ctx.strokeStyle = "#CCCCCC";
    ctx.stroke();

    // Number of AC grid
    ctx.beginPath();
    ctx.textAlign = 'left';
    ctx.textBaseLine = 'middle';
    var inc = Math.floor(len / 7 + 1);
    for (var Y = 0; Y < len; Y += inc) {
      var yy = Math.floor(y2 - (Y / len) * ylen) + 0.5;
      ctx.moveTo(x1, yy); ctx.lineTo(x2, yy);
      if (Y) ctx.fillText(Y >= 1e5
        ? (Math.floor(Y * 1e-3) + 'K') : Y, x2 + 3, yy + 3);
    }
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y1);
    ctx.strokeStyle = "#CCCCCC";
    ctx.stroke();

    ctx.beginPath();
    var prevX = -1, prevY = -1, counter = 0, time = first_sbt[0];
    for (var i = 0; i <= len; i++) {
      var nx = Math.floor(x1 + ((time - start) / tlen) * xlen) + 0.5;
      var ny = Math.floor(y2 - (ygap * counter)) + 0.5;
      if (prevX != nx) {
        if (prevX == -1) ctx.moveTo(nx, ny);
        else ctx.lineTo(nx, ny);
      }
      prevX = nx;
      prevY = ny;
      if (i == len) break;
      time = first_sbt[i];
      counter += inc_amt[i];
    }
    if (prevX != x2) ctx.lineTo(x2, prevY);
    ctx.strokeStyle = "#000";
    ctx.stroke();

    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = '#0000FF';
    ctx.fillText(len >= 1e5
      ? (Math.floor(len * 1e-3) + 'K') : len, x2 + 3, y1 + 3);

    ctx.textAlign = 'center';
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = '#000';
    ctx.fillText(title, (width) / 2, y1 - 12);
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
