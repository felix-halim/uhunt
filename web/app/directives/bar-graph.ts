import {Directive, ElementRef, Input, OnInit, OnChanges} from '@angular/core';

import {Config} from '../config';

@Directive({
  selector: '[uhunt-bar-graph]',
})
export class BarGraphDirective implements OnChanges, OnInit {
  @Input('uhunt-bar-graph') title: string;
  @Input() frequencies: any = {};

  constructor(private _el: ElementRef) {}

  ngOnInit() {
    this.refresh();
  }

  ngOnChanges(changes) {
    this.refresh();
  }

  refresh() {
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
      if (!this.frequencies[order[o]]) this.frequencies[order[o]] = 0;
      ncnt.push(this.frequencies[order[o]]);
      maxcnt = Math.max(maxcnt, this.frequencies[order[o]]);
      sumcnt += this.frequencies[order[o]];
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
      var LO = this.frequencies[order[i]] > 0
        ? Math.log(this.frequencies[order[i]]) : 0;
      var d = Math.ceil(LO / Math.log(10));
      var a = (barsize - d * 5) / 2;
      ctx.font = '9px sans-serif';
      ctx.fillText(this.frequencies[order[i]], x + (barsize / 2), y2 - h - 6);
      ctx.fillText(order[i], x + (barsize / 2), y2 + 10);
    }
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(this.title, width / 2, y1 + 7);
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
