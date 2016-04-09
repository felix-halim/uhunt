import {Injectable} from 'angular2/core';

@Injectable()
export class DatabaseService {

  // List of valid keys to store and its type.
  private keys = {
    'uhunt_prob_search_max_subs': 'int',
    'uhunt_prob_search_max_rank': 'int',
    'uhunt_prob_search_show_last': 'string',
    'uhunt_prob_search_subs_top': 'string',
    'uhunt_prob_search_number': 'int',
    'uhunt_prob_show_search_result': 'bool',
    'show_last_submissions': 'int',
    'show_livesubs': 'bool',
    'livesubs_table_display': 'bool',
    'last_problem_reload': 'int',
    'last_udebug_reload': 'int',
    'probs': 'json',
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
    'vcshadow-view': 'string',
    'vcshadow-sortby': 'string',
    'vcshadow-sortasc': 'bool',
    'vcshadow-n': 'int',
    'show_solved': 'string',
    'sort_desc': 'bool',
    'sort_column': 'string',
    'np_view_which': 'int',
    'show_next_problems': 'int',
    'selected_volume': 'int',
    'ranklist-nabove': 'int',
    'ranklist-nbelow': 'int',
    'cmp_expr': 'string',
    'vcontest_picker_show_unsolved': 'bool',
    'uhunt_vcontest_uids': 'string',
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
      default: alert('Undefined database key: ' + key); break;
    }
  }

  exists(key:string) {
    return localStorage[key] !== null && localStorage[key] !== undefined;
  }

  unset(key:string) {
    localStorage.removeItem(key);
  }
}
