import {Component}  from 'angular2/core';
import {Router}     from 'angular2/router';

@Component({
  template: `TBA`,
})
export class MainComponent {
  constructor(router: Router) {
    router.navigate(['UserStatistics', { id: 339 }]);
  }
}