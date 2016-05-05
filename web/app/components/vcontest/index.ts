import {Component, OnInit, Input}     from 'angular2/core';
import {Control}                      from 'angular2/common';

import {ChatBoxComponent}            from '../chat-box';
import {LogoComponent}               from '../logo';

import {Config}                       from '../../config';

import {User}                         from '../../models/user';
import {Problem}                      from '../../models/problem';
import {Submission}                   from '../../models/submission';

import {VContestGenComponent}         from './generator';

@Component({
  selector: 'uhunt-vcontest',
  template: `
<uhunt-chat-box width="550" height="245" style="float:right; padding-left:25px"
   [user]="user">
</uhunt-chat-box>
<uhunt-logo active="vcontests" [user]="user"></uhunt-logo>
uHunt ran several training series (2013, 2014, 2015) using existing UVa problems
where each series consist of 13 weeks featuring different category of problems.
Below is a tool for generating your own training series.
<br style="clear:both" />
<hr>
<uhunt-vcontest-generator></uhunt-vcontest-generator>
  `,
  directives: [
    VContestGenComponent,
    ChatBoxComponent,
    LogoComponent,
  ],
})
export class VContestComponent implements OnInit {
  @Input() user: User = User.UNKNOWN;

}
