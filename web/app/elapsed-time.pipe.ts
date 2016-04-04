import {Pipe, PipeTransform}  from 'angular2/core';

import {Settings}             from './settings';

/*
 * Formats the value using seconds, hours, days ago.
 * Takes a format argument that defaults to 0.
 * Usage:
 *   value | elapsedTime:format
 * Example:
 *   {{ 1360772292 |  elapsedTime:2}}
 *   formats to: 2013-02-13 08:18
*/
@Pipe({ name: 'elapsedTime' })
export class ElapsedTimePipe implements PipeTransform {
  // To ensure non negative elapsed time.
  delta_time: number = 0;

  transform(value:number, [format]) : string {
    var now = Settings.now;
    this.delta_time = Math.max(this.delta_time, value - now);
    var w = now - value + this.delta_time;
    if (format <= 5 && w < 60) { return Math.ceil(w) + ' secs ago'; }
    if (format <= 4 && w < 60 * 60) { return Math.floor(w / 60) + ' mins ago'; }
    if (format <= 3 && w < 24 * 60 * 60) { return Math.floor(w / 60 / 60) + ' hours ago'; }
    if (format <= 2 && w < 30 * 24 * 60 * 60) { return Math.floor(w / 60 / 60 / 24) + ' days ago'; }
    if (format <= 1 && w < 365 * 24 * 60 * 60) { return Math.floor(w / 60 / 60 / 24 / 30) + ' months ago'; }

    var d = new Date(value * 1000);
    return this.addZeroPrefix(d.getFullYear(), 4) + '-' +
      this.addZeroPrefix(d.getMonth() + 1, 2) + '-' +
      this.addZeroPrefix(d.getDate(), 2) + ' ' +
      this.addZeroPrefix(d.getHours(), 2) + ':' +
      this.addZeroPrefix(d.getMinutes(), 2);
  }

  private addZeroPrefix(v, len) {
    v = '' + v;
    while (v.length < len) {
      v = '0' + v;
    }
    return v;
  }
}
