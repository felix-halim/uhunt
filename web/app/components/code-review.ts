import {Component, Input,
        OnInit}            from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

import {Config}            from '../config';

import {ChatBoxComponent}  from './chat-box'
import {LogoComponent}     from './logo'
import {ProblemComponent}  from './problem';

import {User}              from '../models/user';
import {Problem}           from '../models/problem';
import {Submission}        from '../models/submission';
import {CodeReview,
        CodeReviewSize,
        CodeReviewStatus}  from '../models/code-review';

import {DatabaseService}   from '../services/database';
import {CodeReviewService} from '../services/code-review';
import {HttpService}       from '../services/http';
import {ProblemService}    from '../services/problem';

@Component({
  selector: 'uhunt-code-review',
  templateUrl: 'app/components/code-review.html',
  directives: [
    ChatBoxComponent,
    LogoComponent,
    ProblemComponent,
    ROUTER_DIRECTIVES,
  ],
})
export class CodeReviewComponent implements OnInit {
  @Input() user = new User({userid:339, username: 'Felix Halim'});

  private limit = 5;
  private code_reviews = [];
  private config = Config;

  constructor(
    private _problemService: ProblemService,
    private _codeReviewService: CodeReviewService,
    private _databaseService: DatabaseService) {
  }

  ngOnInit() {
    this.code_reviews.push(this._codeReviewService.get(0));
  }

  status_color(s: CodeReviewStatus) {
    return 'blue';
  }

  status_name(s: CodeReviewStatus) {
    return 'name'
  }
}

