import {Component, Input, OnInit} from 'angular2/core';
import {CanDeactivate}            from 'angular2/router';

import {Config}                   from '../config';

import {ChatMessage, WhosHere}    from '../models/chat';
import {Submission}               from '../models/submission';
import {User}                     from '../models/user';

import {DatabaseService}          from '../services/database';
import {HttpService}              from '../services/http';
import {PollingService}           from '../services/polling';
import {ProblemService}           from '../services/problem';

import {ElapsedTimePipe}          from '../pipes/elapsed-time';

@Component({
  selector: 'uhunt-chat-problem',
  template:
`<span *ngFor="#t of text_links">{{t[0]}}<span *ngIf="t[1]"><a class="{{t[1].getClass(user)}}"
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
export class ChatBoxComponent implements OnInit, CanDeactivate {
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

  uname: string;
  ucode: string;
  logging_in: boolean;

  constructor(
      private _databaseService: DatabaseService,
      private _httpService: HttpService,
      private _pollingService: PollingService) {

    this.is_invisible = this._databaseService.get('chat_invisible');

    this.uname = this._databaseService.get('username');
    this.ucode = this._databaseService.get('uhunt-code');

    this._pollingService.new_session.subscribe(() => {
      if (this._databaseService.get('logged-in')) {
        this.sign_in();
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
  }

  ngOnInit() {
    this._pollingService.set_uid(this.user.id);
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
      var scroll_distance = (el.scrollHeight - (this.height - 20) - el.scrollTop);
      if (forced || scroll_distance < 10) {
        el.scrollTop = el.scrollHeight;
      }
    }, 1);
  }

  post_message() {
    if (this.msg_value.length > 255) {
      alert("Your message is " + (this.msg_value.length - 255) + " characters too long.");
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

  sign_in() {
    console.log('login ', this.uname, this.ucode);
    if (!this.ucode || this.ucode.trim().length == 0) return;
    this.logging_in = true;
    var ts = new Date().getTime();
    var digest = this.MD5(ts + ';' + this.ucode);

    this._httpService.post_text(Config.UHUNT_HOST + '/chat/login/'
      + this._pollingService.session_id + '/' + this.uname + '/' + digest + '/'
      + ts + '/' + this.is_invisible)
      .then(res => {
        var ok = res._body;
        console.log(this.uname + ' login = ', ok);
        if (ok === 'ok') {
          this._databaseService.set('username', this.uname);
          this._databaseService.set('uhunt-code', this.ucode);
          this._databaseService.set('logged-in', true);
          this.signed_in_user = new User({ username: this.uname });
          this.signed_in_user.since = 0;
          if (!this.is_invisible) {
            this.whos_here.add_user(this.signed_in_user);
          }
        } else if (ok === 'invalid code') {
          alert('Invalid UVa username / uHunt code');
          this.signed_in_user = null;
          this._databaseService.set('logged-in', false);
        }
        this.logging_in = false;
      });
    return false;
  }

  sign_out() {
    this.logging_in = true;
    this._httpService.post_text(Config.UHUNT_HOST + '/chat/logout/'
      + this._pollingService.session_id)
    .then(ok => {
      console.log(this.user, ' logout = ' + ok);
      this._databaseService.set('logged-in', false);
      this.whos_here.remove_user(this.signed_in_user);
      this.signed_in_user = null;
      this.logging_in = false;
    });
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

  private MD5(e) {
    function m(h, g) { var j, i, n, l, k; n = h & 2147483648; l = g & 2147483648; j = h & 1073741824; i = g & 1073741824; k = (h & 1073741823) + (g & 1073741823); if (j & i) return k ^ 2147483648 ^ n ^ l; return j | i ? k & 1073741824 ? k ^ 3221225472 ^ n ^ l : k ^ 1073741824 ^ n ^ l : k ^ n ^ l } function o(h, g, j, i, n, l, k) { h = m(h, m(m(g & j | ~g & i, n), k)); return m(h << l | h >>> 32 - l, g) } function p(h, g, j, i, n, l, k) { h = m(h, m(m(g & i | j & ~i, n), k)); return m(h << l | h >>> 32 - l, g) } function q(h, g, j, i, n, l, k) { h = m(h, m(m(g ^ j ^ i, n), k)); return m(h << l | h >>> 32 - l, g) } function r(h, g, j, i, n, l, k) {
      h = m(h, m(m(j ^
        (g | ~i), n), k)); return m(h << l | h >>> 32 - l, g)
    } function s(h) { var g = "", j = "", i; for (i = 0; i <= 3; i++) { j = h >>> i * 8 & 255; j = "0" + j.toString(16); g += j.substr(j.length - 2, 2) } return g } var f = [], t, u, v, w, a, b, c, d; e = function(h) { h = h.replace(/\r\n/g, "\n"); for (var g = "", j = 0; j < h.length; j++) { var i = h.charCodeAt(j); if (i < 128) g += String.fromCharCode(i); else { if (i > 127 && i < 2048) g += String.fromCharCode(i >> 6 | 192); else { g += String.fromCharCode(i >> 12 | 224); g += String.fromCharCode(i >> 6 & 63 | 128) } g += String.fromCharCode(i & 63 | 128) } } return g } (e); f = function(h) {
      var g,
      j = h.length; g = j + 8; for (var i = ((g - g % 64) / 64 + 1) * 16, n = Array(i - 1), l = 0, k = 0; k < j;) { g = (k - k % 4) / 4; l = k % 4 * 8; n[g] |= h.charCodeAt(k) << l; k++ } g = (k - k % 4) / 4; l = k % 4 * 8; n[g] |= 128 << l; n[i - 2] = j << 3; n[i - 1] = j >>> 29; return n
    } (e); a = 1732584193; b = 4023233417; c = 2562383102; d = 271733878; for (e = 0; e < f.length; e += 16) {
      t = a; u = b; v = c; w = d; a = o(a, b, c, d, f[e + 0], 7, 3614090360); d = o(d, a, b, c, f[e + 1], 12, 3905402710); c = o(c, d, a, b, f[e + 2], 17, 606105819); b = o(b, c, d, a, f[e + 3], 22, 3250441966); a = o(a, b, c, d, f[e + 4], 7, 4118548399); d = o(d, a, b, c, f[e + 5], 12, 1200080426); c = o(c, d, a, b, f[e +
        6], 17, 2821735955); b = o(b, c, d, a, f[e + 7], 22, 4249261313); a = o(a, b, c, d, f[e + 8], 7, 1770035416); d = o(d, a, b, c, f[e + 9], 12, 2336552879); c = o(c, d, a, b, f[e + 10], 17, 4294925233); b = o(b, c, d, a, f[e + 11], 22, 2304563134); a = o(a, b, c, d, f[e + 12], 7, 1804603682); d = o(d, a, b, c, f[e + 13], 12, 4254626195); c = o(c, d, a, b, f[e + 14], 17, 2792965006); b = o(b, c, d, a, f[e + 15], 22, 1236535329); a = p(a, b, c, d, f[e + 1], 5, 4129170786); d = p(d, a, b, c, f[e + 6], 9, 3225465664); c = p(c, d, a, b, f[e + 11], 14, 643717713); b = p(b, c, d, a, f[e + 0], 20, 3921069994); a = p(a, b, c, d, f[e + 5], 5, 3593408605); d = p(d,
          a, b, c, f[e + 10], 9, 38016083); c = p(c, d, a, b, f[e + 15], 14, 3634488961); b = p(b, c, d, a, f[e + 4], 20, 3889429448); a = p(a, b, c, d, f[e + 9], 5, 568446438); d = p(d, a, b, c, f[e + 14], 9, 3275163606); c = p(c, d, a, b, f[e + 3], 14, 4107603335); b = p(b, c, d, a, f[e + 8], 20, 1163531501); a = p(a, b, c, d, f[e + 13], 5, 2850285829); d = p(d, a, b, c, f[e + 2], 9, 4243563512); c = p(c, d, a, b, f[e + 7], 14, 1735328473); b = p(b, c, d, a, f[e + 12], 20, 2368359562); a = q(a, b, c, d, f[e + 5], 4, 4294588738); d = q(d, a, b, c, f[e + 8], 11, 2272392833); c = q(c, d, a, b, f[e + 11], 16, 1839030562); b = q(b, c, d, a, f[e + 14], 23, 4259657740);
      a = q(a, b, c, d, f[e + 1], 4, 2763975236); d = q(d, a, b, c, f[e + 4], 11, 1272893353); c = q(c, d, a, b, f[e + 7], 16, 4139469664); b = q(b, c, d, a, f[e + 10], 23, 3200236656); a = q(a, b, c, d, f[e + 13], 4, 681279174); d = q(d, a, b, c, f[e + 0], 11, 3936430074); c = q(c, d, a, b, f[e + 3], 16, 3572445317); b = q(b, c, d, a, f[e + 6], 23, 76029189); a = q(a, b, c, d, f[e + 9], 4, 3654602809); d = q(d, a, b, c, f[e + 12], 11, 3873151461); c = q(c, d, a, b, f[e + 15], 16, 530742520); b = q(b, c, d, a, f[e + 2], 23, 3299628645); a = r(a, b, c, d, f[e + 0], 6, 4096336452); d = r(d, a, b, c, f[e + 7], 10, 1126891415); c = r(c, d, a, b, f[e + 14], 15, 2878612391);
      b = r(b, c, d, a, f[e + 5], 21, 4237533241); a = r(a, b, c, d, f[e + 12], 6, 1700485571); d = r(d, a, b, c, f[e + 3], 10, 2399980690); c = r(c, d, a, b, f[e + 10], 15, 4293915773); b = r(b, c, d, a, f[e + 1], 21, 2240044497); a = r(a, b, c, d, f[e + 8], 6, 1873313359); d = r(d, a, b, c, f[e + 15], 10, 4264355552); c = r(c, d, a, b, f[e + 6], 15, 2734768916); b = r(b, c, d, a, f[e + 13], 21, 1309151649); a = r(a, b, c, d, f[e + 4], 6, 4149444226); d = r(d, a, b, c, f[e + 11], 10, 3174756917); c = r(c, d, a, b, f[e + 2], 15, 718787259); b = r(b, c, d, a, f[e + 9], 21, 3951481745); a = m(a, t); b = m(b, u); c = m(c, v); d = m(d, w)
    } return (s(a) + s(b) + s(c) +
      s(d)).toLowerCase()
  }
}
