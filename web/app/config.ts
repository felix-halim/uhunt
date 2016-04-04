export class Config {
  public static get RELOAD_PROBLEMS_EVERY_MS(): number {
    return 1 * 60 * 60 * 1000; // One hour.
  }

  public static get UVA_HOST(): string {
    return 'https://uva.onlinejudge.org';
  }

  public static get API_PATH(): string {
    return 'https://uhunt.onlinejudge.org/api';
  }

  public static get now(): number {
    return Math.floor(new Date().getTime() / 1000);
  }

  public static PROBLEM_PDF_LINK(problem_number: number): string {
    var v = Math.floor(problem_number / 100);
    return Config.UVA_HOST + '/external/' + v + '/' + problem_number + '.pdf';
  }

  public static PROBLEM_FULL_LINK(problem_id: number): string {
    return Config.UVA_HOST + '/index.php?option=com_onlinejudge'
      + '&Itemid=8&category=24&page=show_problem&problem=' + problem_id;
  }

  public static PROBLEM_DISCUSSION_LINK(problem_number: number): string {
    return Config.UVA_HOST + '/board/search.php?keywords=' + problem_number;
  }

  public static PROBLEM_RANKLIST_LINK(problem_id: number): string {
    return Config.UVA_HOST + '/index.php?option=com_onlinejudge'
      + '&Itemid=8&page=problem_stats&category=24&problemid=' + problem_id;
  }
}
