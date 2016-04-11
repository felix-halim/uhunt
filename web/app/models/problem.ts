import {Config}  from '../config';
import {User}    from './user';

export class Problem {
  public static get UNKNOWN(): Problem {
    return new Problem([
      0, 0, '--- ? ---', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ProblemStatus.Unavailable
    ]);
  }

  id: number;
  number: number;
  title: string;
  distinct_accepted_user: number;
  best_runtime: number;
  best_memory: number;
  no_verdict_count: number;
  submission_error_count: number;
  cannot_be_judged_count: number;
  in_queue_count: number;
  compilation_error_count: number;
  restricted_function_count: number;
  runtime_error_count: number;
  output_limit_exceeded_count: number;
  time_limit_exceeded_count: number;
  memory_limit_exceeded_count: number;
  wrong_answer_count: number;
  presentation_error_count: number;
  accepted_count: number;
  runtime_limit_ms: number;
  status: ProblemStatus;
  submissions_count: number;

  constructor(a: Array<any>) {
    this.id = a[0];
    this.number = a[1];
    this.title = a[2];
    this.distinct_accepted_user = a[3];
    this.best_runtime = a[4];
    this.best_memory = a[5];
    this.no_verdict_count = a[6];
    this.submission_error_count = a[7];
    this.cannot_be_judged_count = a[8];
    this.in_queue_count = a[9];
    this.compilation_error_count = a[10];
    this.restricted_function_count = a[11];
    this.runtime_error_count = a[12];
    this.output_limit_exceeded_count = a[13];
    this.time_limit_exceeded_count = a[14];
    this.memory_limit_exceeded_count = a[15];
    this.wrong_answer_count = a[16];
    this.presentation_error_count = a[17];
    this.accepted_count = a[18];
    this.runtime_limit_ms = a[19];
    this.status = a[20];

    this.submissions_count = 0;
    for (let j = 0; j < 13; j++) {
       this.submissions_count += a[6 + j];
    }
  }

  getPercentAccepted() {
    return Math.floor(this.accepted_count / this.submissions_count * 100);
  }

  getLevel() {
    return 10 - Math.floor(Math.min(10, Math.log(this.distinct_accepted_user)));
  }

  getClass(u: User): string {
    if (this.status == ProblemStatus.Unavailable) {
      return 'prob prob_x';
    }
    var st = u.getProblemStats(this);
    var ago = (Config.now - st.last_sbt) / 60 / 60 / 24;
    var c = 'prob';
    c += st.ac ? ' sub_ac' : st.ntry ? ' sub_wa' : ' sub_none';
    c +=
      (ago <= 2) ? ' sub_2d' :
        (ago <= 7) ? ' sub_7d' :
          (ago <= 31) ? ' sub_1m' :
            (st.mrun == this.best_memory) ? ' sub_best' : '';
    if (this.status == ProblemStatus.SpecialJudge) {
      c += ' prob_y';
    }
    return c;
  }
}

export enum ProblemStatus {
  Unavailable,
  Available,
  SpecialJudge
}
