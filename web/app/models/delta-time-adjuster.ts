import { Config } from '../config';

export class DeltaTimeAdjuster {
  constructor(private delta: number) { }

  set_now(now: number) {
    this.delta = Math.max(this.delta, now - Config.now);
  }

  get_elapsed(timestamp: number): number {
    return Config.now - timestamp + this.delta;
  }
}
