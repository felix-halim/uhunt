import {Component, Input}  from 'angular2/core';
import {Control}           from 'angular2/common';

import {Config}            from '../config';

import {User}              from '../models/user';
import {Problem}           from '../models/problem';
import {Submission}        from '../models/submission';

import {DatabaseService}   from '../services/database';
import {HttpService}       from '../services/http';
import {ProblemService}    from '../services/problem';

@Component({
  selector: 'uhunt-code-review',
  template:
`<br style="clear:both" />
<hr>
<h2>Code Review</h2>`,
})
export class CodeReviewComponent {}
