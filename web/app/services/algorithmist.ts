import {Injectable}     from 'angular2/core';

@Injectable()
export class AlgorithmistService {
  private available = [
    119,
    10058,
    10306, 10341,
    10672,
    11235, 11292, 11450, 11506, 11512, 11517, 11947, 11974
  ];

  private exists_map = {};

  constructor() {
    for (let number of this.available) {
      this.exists_map[number] = true;
    }
  }

  exists(num: number):boolean {
    return this.exists_map[num];
  }
}
