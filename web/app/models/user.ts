import {Problem}             from './problem';
import {Submission, Verdict} from './submission';

interface HashMapOfSubmissions {
  [key: number]: HashMapOfSubmission;
}

interface HashMapOfSubmission {
  [key: number]: Submission;
}

interface HashMapOfProblemStatistics {
  [key: number]: ProblemStatistics;
}

interface SubmissionCallback {
  (s: Submission): void;
}

export class User {
  public static get UNKNOWN(): User {
    return new User({
      userid: 0,
      name: 'Unknown',
      username: 'unknown',
      rank: -1,
      old: 0,
      ac: 0,
      nos: 0,
      activity: [0, 0, 0, 0, 0]
    });
  }

  id: number;
  name: string;
  username: string;
  rank: number;
  old: boolean;
  accepted_count: number;
  submissions_count: number;
  activity: Activity;

  // 0 means not logged in, otherwise timestamp since last login.
  since: number;

  // Index by pid, then by sid : pid_key[pid][sid] = {ver,run,mem,sbt,lan}.
  pid_key: HashMapOfSubmissions;

  // The cached stats for a particular problem id of this user.
  problem_stats_cache: HashMapOfProblemStatistics;

  // The list of submission.
  submissions: Submission[];

  // Whether the submissions is sorted.
  submissions_is_sorted: boolean;

  constructor(a: any) {
    this.id = a.userid;
    this.name = a.name;
    this.username = a.username;
    this.rank = a.rank;
    this.old = a.old;
    this.accepted_count = a.ac;
    this.submissions_count = a.nos;
    this.activity = a.activity;
    this.since = a.since;

    this.pid_key = {};
    this.problem_stats_cache = {};
    this.submissions = [];
    this.submissions_is_sorted = true;
  }

  // Inserts or update submissions of this user.
  insertOrUpdate(s: Submission) {
    if (!this.pid_key[s.problem.id]) {
      this.pid_key[s.problem.id] = {};
    }

    // Resets the stats when this problem id is updated.
    this.problem_stats_cache[s.problem.id] = null;

    var p = this.pid_key[s.problem.id];

    if (!p[s.id]) {
      p[s.id] = s;
      if (this.submissions.length > 0 
        && this.submissions_is_sorted 
        && s.id < this.submissions[this.submissions.length - 1].id) {
        this.submissions_is_sorted = false;
      }
      this.submissions.push(s);
    }
  }

  // Returns the problem statistics of the problem.id submitted by this user.
  getProblemStats(problem: Problem): ProblemStatistics {
    if (this.problem_stats_cache[problem.id]) {
      return this.problem_stats_cache[problem.id];
    }

    var p = this.pid_key[problem.id];
    var ps = new ProblemStatistics(problem);
    if (!p) { return ps; }

    for (var sid in p) {
      var s: Submission = p[sid];
      ps.nos++;
      ps.last_sbt = Math.max(ps.last_sbt, s.submit_time);
      if (s.verdict === Verdict.Accepted) {
        ps.ac = true;
        ps.first_ac_sbt = Math.min(ps.first_ac_sbt, s.submit_time);
        ps.mrun = Math.min(ps.mrun, s.runtime_ms);
        ps.mmem = Math.min(ps.mmem, s.memory_mb);
        ps.rank = Math.min(ps.rank, s.rank);
      }
    }

    if (!ps.ac) {
      // The number of submissions are the number of try.
      ps.ntry = ps.nos;
    } else {
      // Count the number of submissions before the first Accepted.
      this.each_pid(problem.id, function(s) {
        if (s.submit_time < ps.first_ac_sbt) {
          ps.ntry++;
        }
      });
    }

    return this.problem_stats_cache[problem.id] = ps;
  }

  // Loops through all problem ids contained in this user's submissions.
  each_pid(pid: number, f: SubmissionCallback) {
    var sids: HashMapOfSubmission = this.pid_key[pid];
    for (var sid in sids) {
      f(sids[sid]);
    }
  }

  // Loops through the last 'n' submissions of this user.
  each_last_subs(n, f) {
    if (!this.submissions_is_sorted) {
      this.submissions.sort(function(a, b) { return a.id - b.id; });
      this.submissions_is_sorted = true;
    }
    for (var i = 0; i < n && i < this.submissions.length; i++) {
      f(this.submissions[this.submissions.length - 1 - i]);
    }
  }

  // the histogram of various verdicts
  submissions_count_by_verdict() {
    var cnt = {};
    for (var problem_id in this.pid_key) {
      var p = this.pid_key[problem_id];
      for (var sid in p) {
        var s = p[sid];
        if (!cnt[s.verdict]) {
          cnt[s.verdict] = 0;
        }
        cnt[s.verdict]++;
      }
    }
    return cnt;
  }
}

export class Activity {
  two_days: number;
}

export class ProblemStatistics {
  ac: boolean;
  nos: number;
  ntry: number;
  last_sbt: number;
  rank: number;
  first_ac_sbt: number;
  mrun: number;
  mmem: number;

  constructor(public problem: Problem) {
    if (!problem) throw 'null problem';
    this.ac = false;
    this.nos = 0;
    this.ntry = 0;
    this.last_sbt = -1e100;
    this.rank = 1e100;
    this.first_ac_sbt = 1e100;
    this.mrun = 1e100;
    this.mmem = 1e100;
  }

  best_runtime() {
    return Math.min(this.mrun, this.problem.best_runtime);
  }

  diff_with_best_runtime() {
    return this.mrun > 1e50 ? -1 : (this.mrun - this.best_runtime());
  }
}
