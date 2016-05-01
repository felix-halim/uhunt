import {Problem} from './problem';
import {User} from './user';

export enum CodeReviewStatus {
  BUG,
  TOO_SLOW,
  CRASH,
  WRONG_ALGORITHM,
  UNHEALTHY_CODE,
}

export enum CodeReviewSize {
  LARGE
}

export class CodeReview {
  id: number;
  problem: Problem;
  user: User;
  status: CodeReviewStatus;
  size: CodeReviewSize;
  last_comment_ts: number;
  last_comment_by: User;
  last_comment_snippet: string;
}
