import {Directive, ElementRef, Input, OnInit, OnDestroy} from 'angular2/core';

import {Config} from '../config';

// TODO: use | async pipe
@Directive({
  selector: '[uhunt-elapsed-time]',
})
export class ElapsedTimeDirective implements OnInit, OnDestroy {
  // To ensure non negative elapsed time.
  private static delta_time: number = 0;

  // els[i] contains elements that needs to be updated in i unit.
  // There are 4 units: 0: seconds, 1: minutes, 2: hours, 3: days.
  private static els: ElementRef[][] = [[], [], [], []];

  // Delays for each unit.
  private static delays = [
                   1000,
              60 * 1000,
         60 * 60 * 1000,
    24 * 60 * 60 * 1000
  ];

  // ids[i] is the setInterval timer id for the i-th unit.
  private static ids: number[] = [];

  constructor(private _el: ElementRef) {}

  ngOnInit() {
    let unit = ElapsedTimeDirective.get_unit(this._el);
    if (unit < 4) {
      ElapsedTimeDirective.els[unit].push(this._el);
      ElapsedTimeDirective.update_text(unit);
      ElapsedTimeDirective.start_timer(unit);
    } else {
      this._el.nativeElement.innerText =
        ElapsedTimeDirective.get_text(this._el);
    }
  }

  public static start_timer(unit) {
    if (ElapsedTimeDirective.els[unit].length > 0) {
      if (!ElapsedTimeDirective.ids[unit]) {
        ElapsedTimeDirective.ids[unit] =
          setInterval(
            () => ElapsedTimeDirective.update_text(unit),
            ElapsedTimeDirective.delays[unit]);
      }
    }
  }

  ngOnDestroy() {
    for (let i = 0; i < 4; i++) {
      ElapsedTimeDirective.remove(ElapsedTimeDirective.els[i], this._el);
      ElapsedTimeDirective.stop_timer(i);
    }
  }

  private static stop_timer(unit) {
    if (ElapsedTimeDirective.els[unit].length == 0) {
      if (ElapsedTimeDirective.ids[unit]) {
        clearInterval(ElapsedTimeDirective.ids[unit]);
        ElapsedTimeDirective.ids[unit] = null;
      }
    }
  }

  private static update_text(unit) {
    let els = ElapsedTimeDirective.els[unit];
    let level_updated = false;
    for (let i = els.length; i--;) {
      let new_unit = ElapsedTimeDirective.get_unit(els[i]);
      level_updated = level_updated || new_unit > i;
      els[i].nativeElement.innerText = ElapsedTimeDirective.get_text(els[i]);
      ElapsedTimeDirective.els[new_unit].push(els.splice(i, 1)[0]);
    }
    if (level_updated) {
      ElapsedTimeDirective.stop_timer(unit);
      if (unit + 1 < 4) {
        ElapsedTimeDirective.start_timer(unit + 1);
      }
    }
  }

  private static remove(arr, item) {
    for (var i = arr.length; i--;) {
      if (arr[i] === item) {
        arr.splice(i, 1);
      }
    }
  }

  private static get_text(el: ElementRef) {
    let unit = ElapsedTimeDirective.get_unit(el);
    let timestamp = el.nativeElement.dataset.timestamp;
    let elapsed = ElapsedTimeDirective.get_elapsed(timestamp);
    switch (unit) {
      case 0: return Math.ceil(elapsed) + ' secs ago';
      case 1: return Math.floor(elapsed / 60) + ' mins ago';
      case 2: return Math.floor(elapsed / 60 / 60) + ' hours ago';
      case 3: return Math.floor(elapsed / 60 / 60 / 24) + ' days ago';
      default: return ElapsedTimeDirective.full_date(timestamp);
    }
  }

  public static full_date(timestamp) {
    var d = new Date(timestamp * 1000);
    return this.addZeroPrefix(d.getFullYear(), 4) + '-' +
      this.addZeroPrefix(d.getMonth() + 1, 2) + '-' +
      this.addZeroPrefix(d.getDate(), 2) + ' ' +
      this.addZeroPrefix(d.getHours(), 2) + ':' +
      this.addZeroPrefix(d.getMinutes(), 2);
  }

  private static get_unit(el: ElementRef): number {
    let timestamp = el.nativeElement.dataset.timestamp;
    ElapsedTimeDirective.delta_time =
      Math.max(ElapsedTimeDirective.delta_time, timestamp - Config.now);
    let w = ElapsedTimeDirective.get_elapsed(timestamp);
    if (w <= 60) return 0;
    if (w <= 60 * 60) return 1;
    if (w <= 24 * 60 * 60) return 2;
    if (w <= 30 * 24 * 60 * 60) return 3;
    return 4;
  }

  private static get_elapsed(timestamp: number) {
    return Config.now - timestamp + ElapsedTimeDirective.delta_time;
  }

  private static addZeroPrefix(v, len) {
    v = '' + v;
    while (v.length < len) {
      v = '0' + v;
    }
    return v;
  }
}
