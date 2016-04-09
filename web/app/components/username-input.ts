import {Component}     from 'angular2/core';
import {Router}        from 'angular2/router';

import {Config}        from '../config';

import {HttpService}   from '../services/http';

@Component({
  selector: 'uhunt-username-input',
  template:
`<form style="display:inline;" (submit)="location(u.value)">
  <input #u type="text" placeholder="UVa username" value="" size="13">
  <input type="submit" value="View">
</form>`
})
export class UsernameInputComponent {

  constructor(
    private _httpService: HttpService,
    private _router: Router) { }

  location(username) {
    this._httpService.get(
      Config.API_PATH + '/uname2uid/' + username).then(uid => {
        if (uid > 0) {
          this._router.navigate(['UserStatistics', { id: uid }]);
        } else {
          alert('Username not found: ' + username);
        }
      });

    return false;
  }
}
