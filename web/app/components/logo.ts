import {Component, Input, OnChanges}  from 'angular2/core';
import {Router}                       from 'angular2/router';

import {User}                         from '../models/user';

import {StatisticsComponent}          from './statistics';

@Component({
  selector: 'uhunt-logo',
  styles: [`
    a:hover {text-shadow:1px 0px 0px blue;}
  `],
  template:
`<table cellspacing="0" cellpadding="0">
<tr>
  <td>
     <img border="0" src="/images/uva.png" height="70" width="70"
          style="padding-right:15px">
  </td>
  <td>
    <span style="font-size:40px; font-family:Arial; font-weight:bold;">
      uHunt
    </span>
    <br>
    <span style="font-size:12px; font-family: verdana; font-style: italic; ">
      hunt problems that matter
    </span>
    <br>
  </td>
  <td align=center style="padding-left:0px;" width="140">
  </td>
</tr>
</table>
<p style="font-family: verdana">
  <a style="color:blue; cursor:pointer;
            {{active=='statistics' ? 'text-decoration: underline': ''}}"
    (click)="_router.navigate(['Statistics', {id:id}])" class="nou">
      Statistics</a> |
  <a style="color:blue; cursor:pointer;
            {{active=='vcontests' ? 'text-decoration: underline': ''}}"
    (click)="_router.navigate(['VContest'])" class="nou">VContests</a> |
  <a style="color:blue; cursor:pointer;
            {{active=='codereview' ? 'text-decoration: underline': ''}}"
    (click)="_router.navigate(['CodeReview'])" class="nou">Code Review</a> |
  <a style="color:blue; cursor:pointer;
            {{active=='webapi' ? 'text-decoration: underline': ''}}"
    (click)="_router.navigate(['API'])" class="nou">Web API</a> |
  <a style="color:blue; cursor:pointer;
            {{active=='faq' ? 'text-decoration: underline': ''}}"
    (click)="_router.navigate(['FAQ'])" class="nou">FAQ</a>
</p>
`,
})
export class LogoComponent implements OnChanges {
  @Input() user: User;
  @Input() active: string;

  id: string;

  constructor(private _router: Router) { }

  ngOnChanges(changes) {
    this.user = new User({});
    console.log(this.user);
    if (this.user.id) {
      this.id = '' + this.user.id;
      sessionStorage.setItem('id', this.id);
    } else if (sessionStorage.getItem('id')) {
      this.id = sessionStorage.getItem('id');
    // } else if (this._loginService.logged_in_user.id) {
    //   this.id = '' + this._loginService.logged_in_user.id;
    } else {
      this.id = '339';
    }
  }
}
