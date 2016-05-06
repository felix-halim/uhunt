import {Component, Input, OnInit, OnChanges} from '@angular/core';

@Component({
  selector: 'uhunt-bar',
  template:
`<table cellpadding="0" cellspacing="0">
  <tr [style.height.px]="height">
    <td [style.width.px]="width1" [style.background-color]="color"></td>
    <td [style.width.px]="width2" [style.border]="'1px solid ' + color"></td>
  </tr>
</table>`
})
export class BarComponent implements OnInit, OnChanges {
  @Input() width: number;
  @Input() height: number;
  @Input() percent: number;
  @Input() color: string;
  width1: number;
  width2: number;

  ngOnInit() {
    this.refresh();
  }

  ngOnChanges(changes) {
    this.refresh();
  }

  refresh() {
    this.width1 = (Math.floor(this.percent / 10) / 10) * this.width;
    this.width2 = this.width - this.width1;
  }
}
