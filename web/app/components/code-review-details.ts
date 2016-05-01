import {Component, Input,
        OnInit}            from 'angular2/core';
import {ROUTER_DIRECTIVES,
        RouteParams}       from 'angular2/router';

import {Config}            from '../config';

import {ProblemComponent}  from './problem';

import {User}              from '../models/user';
import {Problem}           from '../models/problem';
import {Submission}        from '../models/submission';
import {CodeReview,
        CodeReviewSize,
        CodeReviewStatus}  from '../models/code-review';

import {CodeReviewService} from '../services/code-review';
import {DatabaseService}   from '../services/database';
import {HttpService}       from '../services/http';
import {ProblemService}    from '../services/problem';

@Component({
  selector: 'uhunt-code-review-details',
  templateUrl: 'app/components/code-review-details.html',
  directives: [
    ProblemComponent,
    ROUTER_DIRECTIVES,
  ],
  styles: [`
td.code {
  border-style: none solid none none;
  border-width: 1px;
  font-family: courier;
  font-size: 13px;
  padding-left: 10px;
  white-space: pre-wrap;
}
td.linenumber {
  border-style: none solid none solid;
  border-width: 1px;
  font-family: courier;
  font-size: 13px;
  padding-right: 8px;
  text-align: right;
  width: 30px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
  `]
})
export class CodeReviewDetailsComponent implements OnInit {
  @Input() user = new User({userid:339, username: 'Felix Halim'});

  private limit = 5;
  private code_review: CodeReview;
  private config = Config;
  private a_lines = [];

  constructor(
    private _problemService: ProblemService,
    private _codeReviewService: CodeReviewService,
    private _routeParams: RouteParams,
    private _databaseService: DatabaseService) {
  }

  ngOnInit() {
    var id = parseInt(this._routeParams.get('id'), 10);
    this.code_review = this._codeReviewService.get(id);

    this.a_lines = `#include <stdio.h>

#define FOR(i,a,b) for (int i=(a),_b=(b); i<=_b; i++)
#define REP(i,n) for (int i=0,_n=(n); i<_n; i++)

#define MAXN 1000000

int memo[MAXN];

inline int store(int n, int c){
  if (n<MAXN) memo[n] = c;
  return c;
}

int cycle(int n){
  if (n<MAXN && memo[n]) return memo[n];
  if (n==1) return memo[n] = 1;
  if (n%2==0) return store(n, 1 + cycle(n/2));
  return store(n, 2 + cycle((3*n+1)/2));
}

int main(){
  for (int a,b; scanf("%d %d",&a,&b)!=EOF; ){
    printf("%d %d ",a,b);
    int maxC = 1;
    FOR(i,a<?b,a>?b) maxC >?= cycle(i);
    printf("%d\\n",maxC);
  }
}
`.split('\n');
  }

  status_color(s: CodeReviewStatus) {
    return 'blue';
  }

  status_name(s: CodeReviewStatus) {
    return 'name'
  }
}