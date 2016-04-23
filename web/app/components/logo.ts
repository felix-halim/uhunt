import {Component, Input, OnChanges}  from 'angular2/core';
import {ROUTER_DIRECTIVES, Router}    from 'angular2/router';

import {User}                         from '../models/user';

import {StatisticsComponent}          from './statistics';

@Component({
  selector: 'uhunt-logo',
  directives: [ROUTER_DIRECTIVES],
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
  <a [routerLink]="['./Statistics', {id:id}]" class="nou" 
    style="{{style(['./Statistics', {id:id}])}}">Statistics</a> |
  <a [routerLink]="['./CodeReview']" class="nou"
    style="{{style(['./CodeReview'])}}">Code Review</a> |
  <a [routerLink]="['./VContest']" class="nou"
    style="{{style(['./VContest'])}}">VContests</a> |
  <a [routerLink]="['./API']" class="nou" style="{{style(['./API'])}}">API</a> |
  <a [routerLink]="['./FAQ']" class="nou" style="{{style(['./FAQ'])}}">FAQ</a>
</p>
`,
})
export class LogoComponent implements OnChanges {
  @Input() user: User;

  id: string;

  constructor(private router: Router) {}

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

  style(link) {
    return "color: blue" + (this.router.isRouteActive(
      this.router.generate(link)) ? '; text-decoration: underline' : '');
  }
}
