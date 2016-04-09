import {Problem}             from './models/problem';

export class Config {
  public static get RELOAD_PROBLEMS_EVERY_MS(): number {
    return 1 * 60 * 60 * 1000; // One hour.
  }

  public static get CHAT_ROOM(): string {
    return 'uhunt';
  }

  public static get UVA_HOST(): string {
    return 'https://uva.onlinejudge.org';
  }

  public static get UHUNT_HOST(): string {
    return 'https://uhunt.onlinejudge.org';
  }

  public static get API_PATH(): string {
    return Config.UHUNT_HOST + '/api';
  }

  public static get now(): number {
    return Math.floor(new Date().getTime() / 1000);
  }

  public static LIVE_SUBMISSIONS_LINK(): string {
    return Config.UVA_HOST + '/index.php?option=com_onlinejudge&Itemid=19';
  }

  public static PROBLEM_PDF_LINK(p: Problem): string {
    if (!p) return '#';
    var v = Math.floor(p.number / 100);
    return Config.UVA_HOST + '/external/' + v + '/' + p.number + '.pdf';
  }

  public static PROBLEM_FULL_LINK(p: Problem): string {
    if (!p) return '#';
    return Config.UVA_HOST + '/index.php?option=com_onlinejudge'
      + '&Itemid=8&category=24&page=show_problem&problem=' + p.id;
  }

  public static PROBLEM_DISCUSSION_LINK(p: Problem): string {
    if (!p) return '#';
    return Config.UVA_HOST + '/board/search.php?keywords=' + p.number;
  }

  public static PROBLEM_RANKLIST_LINK(p: Problem): string {
    if (!p) return '#';
    return Config.UVA_HOST + '/index.php?option=com_onlinejudge'
      + '&Itemid=8&page=problem_stats&category=24&problemid=' + p.id;
  }
}
