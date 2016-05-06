import {Directive, ElementRef, Input, OnInit, OnDestroy} from '@angular/core';

import {Observable}    from 'rxjs/Observable'
import {Subscription}  from 'rxjs/Subscription'

import {Config} from '../config';

@Directive({
  selector: '[uhunt-elapsed-time]',
})
export class ElapsedTimeDirective implements OnInit, OnDestroy {
  // To ensure non negative elapsed time.
  private static delta_time = 0;

  // Observables for updating the elements for each unit.
  // There are 4 units: 0: seconds, 1: minutes, 2: hours, 3: days.
  private static intervals = [
    Observable.interval(1000),
    Observable.interval(60 * 1000),
    Observable.interval(60 * 60 * 1000),
    Observable.interval(24 * 60 * 60 * 1000)
  ];

  @Input('uhunt-elapsed-time') timestampString;

  private timestamp: number;
  private unit = -1;
  private subscription: Subscription;

  constructor(private _el: ElementRef) {}

  ngOnInit() {
    this.timestamp = parseInt(this.timestampString, 10);
    if (!isNaN(this.timestamp)) {
      this.update_text();
    }
  }

  private update_text() {
    let new_unit = ElapsedTimeDirective.get_unit(this.timestamp);
    if (new_unit > this.unit) {
      this.subscription && this.subscription.unsubscribe();
      this.unit = new_unit;
      this.subscription = (this.unit < 4)
        ? ElapsedTimeDirective.intervals[this.unit]
            .subscribe(() => this.update_text())
        : null;
    }
    this._el.nativeElement.innerText =
      ElapsedTimeDirective.get_text(this.timestamp, this.unit);
  }

  ngOnDestroy() {
    this.subscription && this.subscription.unsubscribe();
  }

  private static get_text(timestamp: number, unit: number) {
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

  private static get_unit(timestamp: number): number {
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
