import {Component, OnInit, Input}     from '@angular/core';
import {RouteParams}                  from '@angular/router-deprecated';
import {Control}                      from '@angular/common';

import {Config}                       from '../../config';

import {TimerComponent}               from '../timer';

import {Contest, ContestStatus}       from '../../models/contest';
import {User}                         from '../../models/user';
import {Problem}                      from '../../models/problem';
import {Submission}                   from '../../models/submission';

import {HttpService}                  from '../../services/http';
import {ProblemService}               from '../../services/problem';
import {VContestService}              from '../../services/vcontest';

@Component({
  selector: 'uhunt-vcontest',
  templateUrl: 'app/components/vcontest/scoreboard.html',
  directives: [ TimerComponent ],
})
export class VContestScoreboardComponent implements OnInit {
  @Input() user: User = User.UNKNOWN;

  contest: Contest;
  include_shadows: boolean;

  valid_uid = {};

  constructor(
    private httpService: HttpService,
    private contestService: VContestService,
    private problemService: ProblemService,
    private routeParams: RouteParams) {}

  ngOnInit() {
    this.contestService.start(this.routeParams.get('id')).subscribe((c) => {
      this.contest = c;
      if (c.status == ContestStatus.RUNNING) {
        this.include_shadows = !!c.id;
        console.log(c);
        // this.run_shadows();
        // this.render_ranklist();
        // this.refresh_last_subs(monitor);
        // this.update_status();
        // this.tpl.update_sbt();
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
}
