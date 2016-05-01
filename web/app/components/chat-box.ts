import {Component, Input,
        OnInit, OnChanges,
        Pipe, PipeTransform}      from 'angular2/core';
import {CanDeactivate}            from 'angular2/router';

import {Config}                   from '../config';

import {ChatMessage, WhosHere}    from '../models/chat';
import {User}                     from '../models/user';

import {DatabaseService}          from '../services/database';
import {HttpService}              from '../services/http';
import {LoginService}             from '../services/login';
import {PollingService}           from '../services/polling';
import {ProblemService}           from '../services/problem';

import {ElapsedTimeDirective}     from '../directives/elapsed-time';


@Pipe({ name: 'elapsedTime' })
export class ElapsedTimePipe implements PipeTransform {
  transform(value: number): string {
    var delta = new Date().getTime() - value;
    var dur = Math.max(0, Math.floor(delta / 1000 / 60));
    if (dur < 60) { return dur + 'm'; }
    dur = Math.floor(dur / 60);
    if (dur < 24) { return dur + 'h'; }
    if (dur < 24 * 30) { return Math.floor(dur / 24) + 'd'; }
    return Math.floor(dur / 24 / 30) + 'M';
  }
}

@Component({
  selector: 'uhunt-chat-problem',
  template:
`<span *ngFor="let t of text_links">{{t[0]}}<span *ngIf="t[1]"><a class="{{t[1].getClass(user)}}"
  href="{{config.problem_pdf_link(t[1].number)}}" target="_blank">{{t[1].number}}</a>
(<a class="nou" href="{{config.problem_ranklist_link(t[1].id)}}" target="_blank">r</a>|<a class="nou"
  href="{{config.problem_discussion_link(t[1].number)}}" target="_blank">d</a>)</span></span>`
})
export class ChatProblemComponent implements OnInit {
  @Input() user: User;
  @Input() text: string;

  // Array of pairs <string, problem>.
  private text_links: any[] = [];

  private config = Config;

  constructor(private _problemService: ProblemService) {}

  ngOnInit() {
    for (let msg of this.text.split(' ')) {
      let prefix = '', suffix = '';
      for (let k = 0; k < msg.length; k++) {
        var ch = msg.charAt(k);
        if (suffix.length > 0) { suffix += ch; }
        else if (('0' <= ch && ch <= '9') || ('a' <= ch && ch <= 'z')
              || ('A' <= ch && ch <= 'Z')) { prefix += ch; }
        else { suffix += ch; }
      }
      this.text_links.push([' ', null]);
      var p = this._problemService.getProblemByNumber(parseInt(prefix, 10));
      if (p.id) {
        this.text_links.push(['', p]);
        this.text_links.push([suffix, null]);
      } else {
        this.text_links.push([msg, null]);
      }
    }
  }
}

@Component({
  selector: 'uhunt-chat-box',
  templateUrl: 'app/components/chat-box.html',
  directives: [
    ChatProblemComponent
  ],
  pipes: [ElapsedTimePipe]
})
export class ChatBoxComponent implements OnChanges, CanDeactivate {
  @Input() width: number;
  @Input() height: number;
  @Input() user: User; // Viewing user.

  private messages: ChatMessage[] = [];
  private whos_here: WhosHere = new WhosHere();
  private uname: string;
  private ucode: string;
  private is_invisible = false;
  private show_login_dialog = false;
  private is_posting = false;
  private msg_value = "";
  private etd = ElapsedTimeDirective;

  constructor(
      private _databaseService: DatabaseService,
      private _httpService: HttpService,
      private _loginService: LoginService,
      private _pollingService: PollingService) {

    this.uname = this._databaseService.get('username');
    this.ucode = this._databaseService.get('uhunt-code');
    this.is_invisible = this._databaseService.get('chat_invisible');

    this._pollingService.new_session.subscribe(() => {
      if (this._databaseService.get('logged-in')) {
        this._loginService.sign_in(this.uname, this.ucode, this.is_invisible);
      }
    });

    this._pollingService.chat_messages.subscribe((chats: ChatMessage[]) => {
      if (chats.length > 0) {
        for (let c of chats) {
          this.messages.push(c);
        }
        if (this.messages.length > 100) {
          this.messages.splice(0, this.messages.length - 100);
        }
        this.scroll_to_bottom(true);
      }
    });

    this.poll_whos_here();

    console.log('Created Chat Box');

    this._loginService.subscribe(u => {
      if (u.since) {
        if (!this.is_invisible) {
          this.whos_here.add_user(u);
        }
      } else {
        this.whos_here.remove_user(u);
      }
    });
  }

  ngOnChanges() {
    if (this.user) {
      this._pollingService.set_uid(this.user.id);
    }
  }

  routerCanDeactivate(next, prev) {
    // TODO: this doesn't seem to work.
    var xhr = new XMLHttpRequest();
    if (!xhr) return;
    xhr.open("post", Config.UHUNT_HOST + '/chat/leave/'
      + this._pollingService.session_id, false);
    xhr.send();
    console.log('Leaving chat');
    return true;
  }

  scroll_to_bottom(forced) {
    setTimeout(() => {
      var el = document.getElementById('uhunt_chat_viewer');
      var scroll_distance =
        (el.scrollHeight - (this.height - 20) - el.scrollTop);
      if (forced || scroll_distance < 10) {
        el.scrollTop = el.scrollHeight;
      }
    }, 1);
  }

  post_message() {
    if (this.msg_value.length > 255) {
      alert("Your message is " + (this.msg_value.length - 255)
        + " characters too long.");
    } else if (this.msg_value.length > 0 && !this.is_posting) {
      this.is_posting = true;

      this._httpService.post(
        Config.UHUNT_HOST + '/chat/post/' + this._pollingService.session_id,
        { text: this.msg_value })
      .then(res => {
        if (res == 'ok') {
          this.msg_value = "";
        } else if (res === 'need login') {
          alert('You need to sign in to post a message');
          this.show_login_dialog = true;
        } else {
          alert('Server encountered a problem');
        }
        this.is_posting = false;
        this.scroll_to_bottom(false);

        setTimeout(() => {
          document.getElementById('uhunt_chat_post_id').focus();
        }, 100);
      });
    }
    return false;
  }

  set_invisible(invisible) {
    this._databaseService.set('chat_invisible', this.is_invisible = invisible);
  }

  private uname_cmp(a:User, b:User) {
    var A = a.username.toLowerCase();
    var B = b.username.toLowerCase();
    return A < B ? -1 : (A > B ? 1 : 0);
  }

  private poll_whos_here() {
    this._httpService.get(
      Config.UHUNT_HOST + '/chat/whos_here/' + Config.CHAT_ROOM)
    .then(data => {
      this.whos_here.total_users = data.count;
      this.whos_here.server_start_ts = data.server;
      this.whos_here.users.length = 0;
      for (var uid in data) {
        if (data.hasOwnProperty(uid) && uid != 'count' && uid != 'server') {
          var u = data[uid];
          this.whos_here.add_user(new User({
            userid: u.uid,
            username: u.uname,
            since: u.since
          }));
        }
      }
      this.whos_here.users.sort(this.uname_cmp);
      setTimeout(() => this.poll_whos_here(), 60000);
    });
  }
}
