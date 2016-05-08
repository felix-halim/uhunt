import { User }        from './user';
import { Problem }     from './problem';
import { Submission }  from './submission';

export class Contest {
  id: number;
  name: string;
  start_ts: number;
  end_ts: number;
  contestants: User[] = [];
  problems: Problem[] = [];
  past_submissions: Submission[] = [];
  status: ContestStatus;
}

export enum ContestStatus {
  START_DATE,
  STARTING_IN,
  STARTING,
  RUNNING,
};
