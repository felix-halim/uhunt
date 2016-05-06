import {Component}         from '@angular/core';

import {ChatBoxComponent}  from './chat-box';
import {LogoComponent}     from './logo';

@Component({
  template: `
<uhunt-chat-box width="550" height="245" style="float:right; padding-left:25px"
   [user]="user">
</uhunt-chat-box>
<uhunt-logo active="faq" [user]="user"></uhunt-logo>
<br style="clear:both" />
<hr>
<h2 align="center">Frequently Asked Questions</h2>

<ul>
<li>Q: What are the meaning of the colors on some problem numbers?<br>
A: The problem number will will be colored
Red if it was last submitted less than <b style="color:#FF0000">2 days</b> ago,
Green for less than <b style="color:#00AA00">1 week</b> ago,
Blue for less than <b style="color:#0000FF">1 month</b> ago,
Orange if the problem is <b style="color:orange">not yet Accepted</b>,
otherwise, <b>Black</b>.
In the ChatBox and in the Live Submissions, some problem numbers will be
<u>underlined</u> if you have solved the problem.
The <b>bold problem numbers</b> in the statistics denotes that the runtime of
your submission is equal to the best runtime (rank 1 of that problem).
</li>
<li>Q: What are the "2d, 7d, 31d" in the world ranklist table?<br>
A: They represents the number of (distinct) solved problems in the past 2 days,
7 days, and 31 days respectively.
</ul>
  `,
  directives: [
    ChatBoxComponent,
    LogoComponent,
  ],
})
export class FAQComponent {
}
