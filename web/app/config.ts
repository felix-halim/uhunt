import {Problem}             from './models/problem';

export class Config {
  private static verdict_map = {
     0: { name: "- In queue -",        short_name: "QU", color: "#000000" }, // OT
    10: { name: "SubmissionErr",       short_name: "SE", color: "#000000" }, // OT
    15: { name: "Can't be judged",     short_name: "CJ", color: "#000000" }, // OT
    20: { name: "- In queue -",        short_name: "QU", color: "#000000" }, // OT
    30: { name: "Compile error",       short_name: "CE", color: "#AAAA00" },
    35: { name: "Restricted function", short_name: "RF", color: "#000000" }, // OT
    40: { name: "Runtime error",       short_name: "RE", color: "#00AAAA" },
    45: { name: "Output limit",        short_name: "OL", color: "#000066" },
    50: { name: "Time limit",          short_name: "TL", color: "#0000FF" },
    60: { name: "Memory limit",        short_name: "ML", color: "#0000AA" },
    70: { name: "Wrong answer",        short_name: "WA", color: "#FF0000" },
    80: { name: "PresentationE",       short_name: "PE", color: "#666600" },
    90: { name: "Accepted",            short_name: "AC", color: "#00AA00" },
  };

  private static verdict_sname2code;

  private static language_map = {
    1: { name: 'ANSI C',  color: 'darkorange' },
    2: { name: 'Java',    color: 'red'        },
    3: { name: 'C++',     color: 'blue'       },
    4: { name: 'Pascal',  color: 'black'      },
    5: { name: 'C++11',   color: 'blue'       },
    6: { name: 'Python',  color: 'yellow'     },
    7: { name: 'Go',      color: 'brown'      },
  };

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

  public static verdict_code(short_name) {
    if (!Config.verdict_sname2code) {
      Config.verdict_sname2code = {};
      for (let code in Config.verdict_map) {
        Config.verdict_sname2code[Config.verdict_map[code].short_name] = code;
      }
    }
    return Config.verdict_sname2code[short_name];
  }

  public static verdict_color(code) {
    let v = Config.verdict_map[code];
    return v ? v.color : '#000000';
  }

  public static verdict_name(code) {
    let v = Config.verdict_map[code];
    return v ? v.name : '-- ? --';
  }

  public static language_name(code) {
    let e = Config.language_map[code];
    return e ? e.name : '- ? -';
  }

  public static language_color(code) {
    let e = Config.language_map[code];
    return e ? e.color : '#000000';
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
