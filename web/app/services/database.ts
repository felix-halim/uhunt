import {Injectable} from 'angular2/core';

@Injectable()
export class DatabaseService {

  // List of valid keys to store and its type.
  private keys = {
    'uhunt_problems': 'json',
    'uhunt_problems_last_sync': 'int',
    'uhunt_prob_search_max_subs': 'int',
    'uhunt_prob_search_max_rank': 'int',
    'uhunt_prob_search_show_last': 'string',
    'uhunt_prob_search_subs_top': 'string',
    'uhunt_prob_search_number': 'int',
    'uhunt_prob_show_search_result': 'bool',
    'uhunt_user_statistics_num_last_subs': 'int',
    'uhunt_user_statistics_show_solved': 'string',
    'uhunt_next_probs_sort_desc': 'bool',
    'uhunt_next_probs_sort_column': 'string',
    'uhunt_next_probs_view_which': 'int',
    'uhunt_next_probs_max': 'int',
    'uhunt_next_probs_volume': 'int',
    'uhunt_ranklist_nabove': 'int',
    'uhunt_ranklist_nbelow': 'int',
    'uhunt_statscmp_expr': 'string',
    'uhunt_vcontest_contestants': 'string',
    'uhunt_picker_show_unsolved': 'bool',
    'uhunt_picker_difficulty': 'int',
    'uhunt_past_contest_view': 'string',
    'uhunt_past_contest_sort_by': 'string',
    'uhunt_past_contest_sort_asc': 'bool',
    'uhunt_past_contest_show': 'int',
    'show_livesubs': 'bool',
    'livesubs_table_display': 'bool',
    'last_udebug_reload': 'int',
    'udebug': 'json',
    'username': 'string',
    'chat_invisible': 'bool',
    'uhunt_series_user_filter': 'json',
    'uhunt_widget_user_filter_chk': 'bool',
    'uhunt_widget_highlight_uids_chk': 'bool',
    'uhunt-code': 'string',
    'logged-in': 'bool',
    'livesub-nshow': 'int',
    'series_index': 'int',
    'cpbook_show': 'string',
    'cpbook_chapter': 'int',
    'cpbook_edition': 'int',
    'show_live_submissions': 'int',
  };

  constructor() { }

  set(key: string, val) {
    if (val === null || val === undefined) {
      console.error('Setting to null/undefined for ' + key
        + '. Please use unset(key) instead.');
      return;
    }
    try {
      switch (this.keys[key]) {
        case 'int': localStorage[key] = val; break;
        case 'string': localStorage[key] = val; break;
        case 'bool': localStorage[key] = val ? '1' : '0'; break;
        case 'json': localStorage[key] = JSON.stringify(val); break;
        default: alert('Undefined database key: ' + key); break;
      }
    } catch (e) {
      // Probably insufficient storage?
      console.error(JSON.stringify(e));
    }
  }

  get(key:string) {
    switch (this.keys[key]) {
      case 'int': return parseInt(localStorage[key], 10);
      case 'string': return localStorage[key];
      case 'bool': return localStorage[key] === '1';
      case 'json':
        let val = localStorage[key];
        return val ? JSON.parse(localStorage[key]) : null;
      default: console.error('Undefined database key: ' + key); break;
    }
  }

  exists(key:string) {
    return localStorage[key] !== null && localStorage[key] !== undefined;
  }

  unset(key:string) {
    localStorage.removeItem(key);
  }
}
