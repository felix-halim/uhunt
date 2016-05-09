import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Observable }         from 'rxjs/Observable'
import { Subscription }       from 'rxjs/Subscription'

import { Config }             from '../config';
import { DeltaTimeAdjuster }  from '../models/delta-time-adjuster'

@Component({
  selector: 'uhunt-timer',
  template: '{{text}}',
})
export class TimerComponent implements OnInit, OnDestroy {
  // To ensure non negative elapsed time.
  private static local_adjuster = new DeltaTimeAdjuster(0);

  // Observables for updating the elements for each unit.
  // There are 4 units: 0: seconds, 1: minutes, 2: hours, 3: days.
  private static intervals = [
    Observable.interval(1000),
    Observable.interval(60 * 1000),
    Observable.interval(60 * 60 * 1000),
    Observable.interval(24 * 60 * 60 * 1000)
  ];

  @Input() timestamp: number;
  @Input() adjuster = TimerComponent.local_adjuster;
  text: string;

  private unit = -1;
  private subscription: Subscription;

  ngOnInit() {
    if (!isNaN(this.timestamp) && this.timestamp > 0) {
      this.update_text();
    }
  }

  private update_text() {
    if (this.adjuster == TimerComponent.local_adjuster) {
      TimerComponent.local_adjuster.set_now(this.timestamp);
    }
    let elapsed = this.adjuster.get_elapsed(this.timestamp);
    let new_unit = TimerComponent.get_unit(elapsed);
    if (new_unit > this.unit) {
      this.subscription && this.subscription.unsubscribe();
      this.unit = new_unit;
      this.subscription = (this.unit < 4 || elapsed < 0)
        ? TimerComponent.intervals[Math.min(3, this.unit)]
            .subscribe(() => this.update_text())
        : null;
    }
    this.text = TimerComponent.get_text(this.timestamp, this.unit, elapsed);
  }

  ngOnDestroy() {
    this.subscription && this.subscription.unsubscribe();
  }

  private static get_text(timestamp: number, unit: number, elapsed: number) {
    let suffix = elapsed < 0 ? '' : ' ago';
    elapsed = Math.abs(elapsed);
    switch (unit) {
      case 0: return Math.floor(elapsed) + ' secs' + suffix;
      case 1: return Math.floor(elapsed / 60) + ' mins' + suffix;
      case 2: return Math.floor(elapsed / 60 / 60) + ' hours' + suffix;
      case 3: return Math.floor(elapsed / 60 / 60 / 24) + ' days' + suffix;
      default: return TimerComponent.full_date(timestamp);
    }
  }

  public static full_date(timestamp: number): string {
    var d = new Date(timestamp * 1000);
    return this.addZeroPrefix(d.getFullYear(), 4) + '-' +
      this.addZeroPrefix(d.getMonth() + 1, 2) + '-' +
      this.addZeroPrefix(d.getDate(), 2) + ' ' +
      this.addZeroPrefix(d.getHours(), 2) + ':' +
      this.addZeroPrefix(d.getMinutes(), 2);
  }

  private static get_unit(elapsed: number): number {
    let w = Math.abs(elapsed);
    if (w <= 60) return 0;
    if (w <= 60 * 60) return 1;
    if (w <= 24 * 60 * 60) return 2;
    if (w <= 30 * 24 * 60 * 60) return 3;
    return 4;
  }

  private static addZeroPrefix(num: number, len: number): string {
    let v = '' + num;
    while (v.length < len) {
      v = '0' + v;
    }
    return v;
  }
}
