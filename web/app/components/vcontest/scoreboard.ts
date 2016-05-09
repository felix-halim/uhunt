import {Component, OnInit, Input}     from '@angular/core';
import {RouteParams}                  from '@angular/router-deprecated';
import {Control}                      from '@angular/common';

import {Config}                       from '../../config';

import {TimerComponent}               from '../timer';
import {SubmissionsComponent}         from '../submissions';

import {Contest,
        ContestStatus, Ranklist}      from '../../models/contest';
import {User}                         from '../../models/user';
import {Problem}                      from '../../models/problem';
import {Submission}                   from '../../models/submission';
import {LiveSubmissions}              from '../../models/live-submissions';

import {PollingService}               from '../../services/polling';
import {HttpService}                  from '../../services/http';
import {ProblemService}               from '../../services/problem';
import {VContestService}              from '../../services/vcontest';

@Component({
  selector: 'uhunt-vcontest',
  templateUrl: 'app/components/vcontest/scoreboard.html',
  directives: [
    SubmissionsComponent,
    TimerComponent,
  ],
})
export class VContestScoreboardComponent implements OnInit {
  @Input() user: User = User.UNKNOWN;

  ac_width = 90;
  width: number;
  config = Config;
  include_shadows: boolean;
  include_past_subs: boolean;

  live_submissions = new LiveSubmissions();
  contest: Contest;

  constructor(
    private httpService: HttpService,
    private contestService: VContestService,
    private problemService: ProblemService,
    private pollingService: PollingService,
    private routeParams: RouteParams) {}

  ngOnInit() {
    this.contestService.start(this.routeParams.get('id')).subscribe((c) => {
      this.contest = c;
      if (c.status == ContestStatus.RUNNING) {
        this.include_shadows = !!c.id;

        this.width = Math.floor(620 / this.contest.problems.length);
        if (this.width > this.ac_width) {
          this.width = this.ac_width =
            Math.floor(710 / (this.contest.problems.length + 1));
        }

        let observable = this.contest.start_shadow_submisions();
        this.live_submissions.subscribe(observable);

        // TODO: when out of sync, re-create ranklist.
        let initial_subs = this.contestService.get_contestant_submissions(c);
        this.contest.subscribe(initial_subs);
        this.contest.subscribe(observable);
        this.contest.subscribe(this.pollingService.submissions);
      }
    });
  }

  get isScheduled(): boolean {
    return this.contest && this.contest.status == ContestStatus.START_DATE;
  }

  get isCountingDown(): boolean {
    return this.contest && this.contest.status == ContestStatus.STARTING_IN;
  }

  get isStarting(): boolean {
    return this.contest && this.contest.status == ContestStatus.STARTING;
  }

  get isRunning(): boolean {
    return this.contest && this.contest.status == ContestStatus.RUNNING;
  }

  get contest_status(): string {
    var status = '';
    if (conf.end_sbt < 1e50) {
      var c = now();
      if (conf.start_sbt > c) {
        var t = tpl.format_time_v(conf.start_sbt - c, 1);
        if (t === false)
          status = 'Contest start date: ' + tpl.format_date(conf.start_sbt);
        else
          status = 'Will start in: ' + t;
      }
      else if (conf.end_sbt < c) status = 'Contest has ended';
      else {
        var t = tpl.format_time_v(conf.end_sbt - c, 1);
        if (t === false)
          status = 'Contest end date: ' + tpl.format_date(conf.end_sbt);
        else
          status = 'Time remaining: <font color=yellow>' + t + '</font>';
      }
    }
    $('#contest_status').html(status);
    setTimeout(update_status, 1000);
  }

  format_sub: function(sbt) {  // for ranklist submission table
    var sign = sbt < 0 ? '-' : '';
    sbt = sbt < 0 ? -sbt : sbt;
    var yy = Math.floor(sbt / 60 / 60 / 24 / 365);
    var MM = Math.floor((sbt / 60 / 60 / 24 / 30) % 12);
    if (yy > 0) return sign + yy + ':<font color=blue>'
      + tpl.format_xx(MM) + '</font>';
    var dd = Math.floor((sbt / 60 / 60 / 24) % 30);
    if (MM > 0) return sign + '<font color=blue>' + MM
      + '</font>:<font color=green>' + tpl.format_xx(dd) + '</font>';
    var hh = Math.floor((sbt / 60 / 60) % 24);
    if (dd > 0) return sign + '<font color=green>' + dd + '</font>:'
      + tpl.format_xx(dd);
    var mm = Math.floor(sbt / 60) % 60;
    return sign + hh + ':' + tpl.format_xx(mm);
  }
}
