import {Problem}  from './problem';
import {User}     from './user';

export class Submission {
  id: number;
  user: User;
  problem: Problem;
  verdict: Verdict;
  language: Language;
  runtime_ms: number;
  memory_mb: number;
  rank: number;
  submit_time: number;

  constructor(a: Array<any>) {
    this.id = a[0];
    this.user = a[1];
    this.problem = a[2];
    this.verdict = a[3];
    this.language = a[4];
    this.runtime_ms = a[5];
    this.memory_mb = a[6];
    this.rank = a[7];
    this.submit_time = a[8];
  }

  getRank() {
    return this.rank === -1 ? ' - ' : this.rank;
  }

  getVerdict() {
    return Verdict[this.verdict == 0 ? 20 : this.verdict];
  }

  getVerdictColor() {
    switch (this.verdict) {
      case Verdict.CompileError: return "#AAAA00";
      case Verdict.RuntimeError: return "#00AAAA";
      case Verdict.OutputLimit: return "#000066";
      case Verdict.TimeLimit: return "#0000FF";
      case Verdict.MemoryLimit: return "#0000AA";
      case Verdict.WrongAnswer: return "#FF0000";
      case Verdict.PresentationError: return "#666600";
      case Verdict.Accepted: return "#00AA00";
      default: return "#000000";
    }
  }

  getLanguage() {
    switch (this.language) {
      case Language.ANSI_C: return 'ANSI C';
      case Language.Java: return 'Java';
      case Language.Cpp: return 'C++';
      case Language.Pascal: return 'Pascal';
      case Language.Cpp11: return 'C++11';
      case Language.Go: return 'Go Lang';
    }
    return '- ? -';
  }
}

export enum Verdict {
  SubmissionError = 10,
  CannotBeJudged = 15,
  InQueue = 20,
  CompileError = 30,
  RestrictedFunction = 35,
  RuntimeError = 40,
  OutputLimit = 45,
  TimeLimit = 50,
  MemoryLimit = 60,
  WrongAnswer = 70,
  PresentationError = 80,
  Accepted = 90
}

export enum Language {
  ANSI_C = 1,
  Java = 2,
  Cpp = 3,
  Pascal = 4,
  Cpp11 = 5,
  Go = 6
}
