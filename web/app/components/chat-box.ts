import {Component, Input, OnInit} from 'angular2/core';

import {Config}                   from '../config';

import {ChatMessage, WhosHere}    from '../models/chat';
import {Submission}               from '../models/submission';
import {User}                     from '../models/user';

import {HttpService}              from '../services/http';
import {PollingService}           from '../services/polling';
import {ProblemService}           from '../services/problem';

import {ElapsedTimePipe}          from '../pipes/elapsed-time';

@Component({
  selector: 'uhunt-chat-problem',
  template:
`<span *ngFor="#t of text_links">{{t[0]}}<span *ngIf="t[1]"><a class="{{t[1].getClass(user)}}"
  href="{{problem_pdf_link(t[1].number)}}" target="_blank">{{t[1].number}}</a>
(<a class="nou" href="{{problem_ranklist_link(t[1].id)}}" target="_blank">r</a>|<a class="nou"
  href="{{problem_discussion_link(t[1].number)}}" target="_blank">d</a>)</span></span>`
})
export class ChatProblemComponent implements OnInit {
  @Input() user: User;
  @Input() text: string;

  // Array of pairs <string, problem>.
  text_links: any[] = [];

  problem_pdf_link = Config.PROBLEM_PDF_LINK;
  problem_discussion_link = Config.PROBLEM_DISCUSSION_LINK;
  problem_ranklist_link = Config.PROBLEM_RANKLIST_LINK;

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
      if (p) {
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
  templateUrl: 'app/templates/chat-box.html',
  directives: [
    ChatProblemComponent
  ],
  pipes: [ElapsedTimePipe]
})
export class ChatBoxComponent {
  @Input() width: number;
  @Input() height: number;
  @Input() user: User; // Viewing user.
  @Input() signed_in_user: User;
  @Input() show_login_dialog = false;
  @Input() is_invisible = false;
  @Input() is_posting = false;
  @Input() msg_value = "";

  messages: ChatMessage[] = [];
  whos_here: WhosHere = new WhosHere();

  constructor(
      private _httpService: HttpService,
      private _pollingService: PollingService) {
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
  }

  scroll_to_bottom(forced) {
    setTimeout(() => {
      var el = document.getElementById('uhunt_chat_viewer');
      var scroll_distance = (el.scrollHeight - (this.height - 20) - el.scrollTop);
      if (forced || scroll_distance < 10) {
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }

  post_message() {
    if (!this.signed_in_user) {
      this.show_login_dialog = true;
    } else {
      this.is_posting = true;
      setTimeout(() => {
        this.messages.push(new ChatMessage(this.msg_value, false));
        this.msg_value = "";
        this.is_posting = false;
        this.scroll_to_bottom(false);
        setTimeout(() => {
          document.getElementById('uhunt_chat_post_id').focus();
        }, 100);
      }, 100);
    }
    return false;
  }

  sign_in(uname, ucode) {
    this.signed_in_user = new User({ userid: 339, username: uname });
    this._pollingService.set_logged_in_user_id(this.signed_in_user.id);
    this.whos_here.add_user(this.signed_in_user);
    return false;
  }

  sign_out() {
    this.whos_here.remove_user(this.signed_in_user);
    this.signed_in_user = null;
  }

  uname_cmp(a, b) {
    var A = a.uname.toLowerCase();
    var B = b.uname.toLowerCase();
    return A < B ? -1 : (A > B ? 1 : 0);
  }

  poll_whos_here() {
    this._httpService.get(
      Config.UHUNT_HOST + '/chat/whos_here/' + Config.CHAT_ROOM).then(data => {
        this.whos_here.total_users = data.count;
        this.whos_here.server_start_ts = data.server;
        this.whos_here.users.length = 0;
        for (var uid in data) {
          if (data.hasOwnProperty(uid) && uid != 'count' && uid != 'server') {
            this.whos_here.users.push(data[uid]);
          }
        }
        this.whos_here.users.sort(this.uname_cmp);
        setTimeout(() => this.poll_whos_here(), 60000);
      });
  }
}


