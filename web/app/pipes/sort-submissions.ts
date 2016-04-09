import {Pipe, PipeTransform}  from 'angular2/core';

import {Submission}           from '../models/submission';

/*
 * Sorts the values based on submit time.
 * Takes a format argument that defaults to 'submit_time'.
 * Usage:
 *   values | sortSubmissions:format
*/
@Pipe({ name: 'sortSubmissions' })
export class SortSubmissionsPipe implements PipeTransform {
  transform(values: any, [format]): string {
    if (format == 'submit_time') {
      values.sort(this.submit_time_cmp);
    }
    return values;
  }

  private submit_time_cmp(a: Submission, b: Submission) {
    return b.submit_time - a.submit_time;
  }
}
