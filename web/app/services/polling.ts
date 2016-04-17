import {Injectable, EventEmitter} from 'angular2/core';

import {Config}                   from '../config';

import {ChatMessage}              from '../models/chat';
import {Submission}               from '../models/submission';
import {User}                     from '../models/user';

import {HttpService}              from './http';
import {ProblemService}           from './problem';

@Injectable()
export class PollingService {
  submissions: EventEmitter<Submission[]> = new EventEmitter();
  chat_messages: EventEmitter<ChatMessage[]> = new EventEmitter();
  out_of_sync: EventEmitter<boolean> = new EventEmitter();
  new_session: EventEmitter<any> = new EventEmitter();
  last_poll_id: number = 0;
  session_id: number = 0;
  ids: any = {};

  constructor(
    private _httpService: HttpService,
    private _problemService: ProblemService) {

    this.ids[Config.CHAT_ROOM] = 0;
    this.ids['lastsubs'] = 0;
    this.ids['uid'] = 0;

    this.poll();
  }

  set_logged_in_user_id(uid) {
    this.ids['uid'] = uid;
  }

  poll() {
    this._httpService.get(Config.UHUNT_HOST + '/poll/' + this.session_id + '/'
      + JSON.stringify(this.ids)).then(res => {
      this._problemService.ready.then(() => {
        if (this.session_id != res.sesid) {
          this.session_id = res.sesid;
          this.new_session.emit(true);
        }
        if (res.msgs['lastsubs']) {
          this.process_submissions(res.msgs['lastsubs']);
        }
        if (res.msgs[Config.CHAT_ROOM]) {
          this.process_chat_messages(res.msgs[Config.CHAT_ROOM]);
        }
        this.poll();
      });
    });
  }

  private process_submissions(subs) {
    var is_out_of_sync = false;
    var submissions = [];
    for (let s of subs) {
      if (this.ids.lastsubs && this.ids.lastsubs + 1 != s.id) {
        console.error('lastsubs out of sync ' + (this.ids.lastsubs + 1) + ' != ' + s.id);
        is_out_of_sync = true;
      }
      this.ids.lastsubs = s.id;
      submissions.push(new Submission([
        s.sid,
        new User({
          userid: s.uid,
          name: s.name,
          username: s.uname
        }),
        this._problemService.getProblemById(s.pid),
        s.ver,
        s.lan,
        s.run,
        s.mem,
        s.rank,
        s.sbt]));
    }
    if (is_out_of_sync) {
      this.out_of_sync.emit(true);
    }
    this.submissions.emit(submissions);
  }

  private process_chat_messages(msgs) {
    var chats = [];
    for (let chat of msgs) {
      this.ids[Config.CHAT_ROOM] = chat.id;
      if (chat.userid == 14031984) {
        var v = JSON.parse(chat.message);
        if (v.rank1pid) {
          v.problem = this._problemService.getProblemById(v.rank1pid);
          if (v.problem.id) {
            chats.push(new ChatMessage(v, true));
          }
        } else {
          console.error('Unknown chat format ', chat);
        }
      } else {
        chats.push(new ChatMessage(chat, false));
      }
    }
    this.chat_messages.emit(chats);
  }
}
