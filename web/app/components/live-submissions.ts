import {Component, Input} from 'angular2/core';

import {Config}           from '../config';
import {Submission}       from '../models/submission';
import {User}             from '../models/user';

import {PollingService}   from '../services/polling';

import {ElapsedTimePipe}  from '../pipes/elapsed-time';

@Component({
  selector: 'uhunt-live-submissions',
  template: `
    <div>
      <table width="970" style="border: 1px solid #AAA; display:{{liveSubmissionsDisplay}}" cellpadding="1">
        <thead>
          <tr class="tablebar" height="25">
          <th align="left" colspan="10" height="25">
            <span style="float:right; font-weight:normal; color:white; padding-right:10px">Show :
              <a class="white" style="cursor:pointer" (click)="limit=5"> 5 </a> |
              <a class="white" style="cursor:pointer" (click)="limit=10"> 10 </a> |
              <a class="white" style="cursor:pointer" (click)="limit=25"> 25 </a> |
              <a class="white" style="cursor:pointer" (click)="limit=50"> 50 </a> |
              <a class="white" style="cursor:pointer" (click)="limit=100"> 100 </a>
            </span>
            &nbsp;
            <a target="_blank" class="white"
               href="{{host}}/index.php?option=com_onlinejudge&Itemid=19">
                 <b>Live Submissions</b>
            </a>
            <a class="white" style="cursor:pointer"
              (click)="liveSubmissionsDisplay='none';
              viewLiveSubmissionsDisplay=''">
                (hide)
            </a>
          </th>
          <tr class="tablesubar" height="20">
            <th width="65" align="left">&nbsp; &nbsp; #</th>
            <th width="40" align="left"></th>
            <th width="185" align="left">&nbsp; Problem Title</th>
            <th width="205" align="left">&nbsp; User (username)</th>
            <th width="110" align="left">&nbsp; Verdict</th>
            <th width="60" align="center">Lang</th>
            <th width="55" align="center">Time</th>
            <th width="55" align="center">Best</th>
            <th width="55" align="center">Rank</th>
            <th width="120" align="center">Submit Time</th>
          </tr>
        </thead>

        <tbody class="alt_colors" style="font-family:verdana; font-size:11px">
          <tr style="height:18px" *ngFor="#s of live_submissions | slice:0:limit">
            <td>&nbsp;{{s.id}}</td>
            <td align="right">
              <a class="{{s.problem.getClass(user)}}"
                 href="{{problem_pdf_link(s.problem.number)}}" target="_blank">
                   {{s.problem.number}}
              </a>
            </td>
            <td>
              <span style="float:right; padding-right:5px">
                <!--span ng-bind-html-unsafe="s.p.num | algorithmist:'|'"></span-->
                <a class="nou" target="_blank"
                  href="{{problem_discussion_link(s.problem.number)}}">discuss</a>
              </span>
              <a class="ellipsis" style="margin-left:5px; width:{{130 - 10 - 0}}px;
                color:black;" target='_blank' href="{{problem_full_link(s.problem.id)}}">
                  {{s.problem.title}}
              </a>
            </td>
            <td>
              <a class='ellipsis' style='margin-left:5px; width:{{205 - 10}}px'
                target='_blank' href='/id/{{s.user.id}}'>
                  {{s.user.name + ' (' + s.user.username + ')' }}
              </a>
            </td>
            <td style="font-weight:bold; color:{{s.getVerdictColor()}}">
              &nbsp;{{ s.getVerdict() }}
            </td>
            <td align="center">{{s.getLanguage()}}</td>
            <td align="center">{{s.runtime_ms * 1e-3 | number:'1.3-3'}}</td>
            <td align="center">
              <a target="_blank" class="nou" href="{{problem_ranklist_link(s.problem.id)}}">
                {{s.problem.best_runtime * 1e-3 | number:'1.3-3'}}
              </a>
            </td>
            <td align="center">{{s.getRank()}}</td>
            <td align="center">{{s.submit_time | elapsedTime:2}}</td>
          </tr>
        </tbody>
      </table>

      <p>
        <a (click)="viewLiveSubmissionsDisplay='none';
         liveSubmissionsDisplay=''"
         style="cursor:pointer; text-decoration:none; color:blue;
           display:{{viewLiveSubmissionsDisplay}}">
             View Live Submissions
        </a>
      </p>
    </div>
  `, 
  pipes: [ElapsedTimePipe]
})
export class LiveSubmissionsComponent {
  @Input() user: User;
  live_submissions: Submission[] = [];
  limit = 5;
  viewLiveSubmissionsDisplay = 'none';

  host = Config.UVA_HOST;
  problem_full_link = Config.PROBLEM_FULL_LINK;
  problem_pdf_link = Config.PROBLEM_PDF_LINK;
  problem_discussion_link = Config.PROBLEM_DISCUSSION_LINK;
  problem_ranklist_link = Config.PROBLEM_RANKLIST_LINK;

  constructor(_pollingService: PollingService) {
    _pollingService.submissions.subscribe((s: Submission) => this.update(s));
    this.refresh();
  }

  private update(sub) {
    var replaced = false;
    for (let i = 0; i < this.live_submissions.length; i++) {
      var s = this.live_submissions[i];
      if (s.id == sub.id) {
        this.live_submissions[i] = sub;
        replaced = true;
      }
    }
    if (!replaced) {
      this.live_submissions.unshift(sub);
      if (this.live_submissions.length > 100) {
        this.live_submissions.pop();
      }
    }
  }

  private refresh() {
    for (let s of this.live_submissions) {
      s.submit_time += 1e-6;
    }
    setTimeout(() => this.refresh(), 1000);
  }
}
