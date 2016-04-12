import {Component, Input, OnChanges} from 'angular2/core';

import {Config}               from '../config';

import {User}                 from '../models/user';
import {Problem}              from '../models/problem';
import {Submission}           from '../models/submission';

import {DatabaseService}      from '../services/database';
import {HttpService}          from '../services/http';
import {ProblemService}       from '../services/problem';
import {UserService}          from '../services/user';

@Component({
  selector: 'uhunt-world-ranklist',
  templateUrl: 'app/components/world-ranklist.html',
})
export class WorldRanklistComponent implements OnChanges {
  @Input() user: User;

  nabove: number = 10;
  nbelow: number = 10;
  ranklist: any[] = [];

  private config = Config;

  constructor(
    private _databaseService: DatabaseService,
    private _httpService: HttpService) {}

  ngOnChanges(changes) {
    this.refresh();
  }

  set_nabove(val) {
    this._databaseService.set('uhunt_ranklist_nabove', this.nabove = val);
    this.refresh();
  }

  set_nbelow(val) {
    this._databaseService.set('uhunt_ranklist_nbelow', this.nbelow = val);
    this.refresh();
  }

  refresh() {
    this._httpService.get(Config.API_PATH + '/ranklist/' + this.user.id + '/'
      + (this._databaseService.get('uhunt_ranklist_nabove') || 10) + '/' 
      + (this._databaseService.get('uhunt_ranklist_nbelow') || 10))
    .then((arr) => {
      arr.sort(this.rank_cmp);
      this.ranklist = arr;
    });
  }

  private rank_cmp(a, b) {
    return a.rank - b.rank;
  }

  /*
  var ac = submissions.ac_pids.length;
  var canvas = $('#percentile_canvas').html(;
  var width = 200, height = 475;
  if (!canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,width+10,height+10);

  var x1 = 20.5, y1 = 20.5, x2 = width-50.5, y2 = height-50.5;

  // Filled triangle
  ctx.beginPath();
  ctx.moveTo(x2,y2);
  var mx = Math.log(solved_percentile[1]);
  var sum = 0, mine = 0, mxh = Math.log(solved_percentile.length);
  for (var i=1; i<solved_percentile.length; i++){
    var w = solved_percentile[i];
    if (i >= 16) sum += w;
    if (i <= ac) mine = sum;
    if (w) w = Math.log(w) / mx * (x2-x1);
    h = Math.log(i) / mxh * (y2-y1);
    ctx.lineTo(x2-w, y2 - h);

  }
  ctx.fillStyle = '#ADF';
  ctx.fill();


  ctx.fillStyle = '#000';
  ctx.strokeStyle = "#000";

  ctx.beginPath(); ctx.moveTo(x2,y1); ctx.lineTo(x2,y2); ctx.stroke(); // Y axis
  ctx.beginPath(); ctx.moveTo(x1,y2); ctx.lineTo(x2,y2); ctx.stroke(); // X axis

  for (var i=1; i<=solved_percentile.length; i*=2){
    var h = Math.floor(Math.log(i) / mxh * (y2-y1));
    ctx.beginPath();
    ctx.moveTo(x2,y2-h);
    ctx.lineTo(x2+5,y2-h);
    ctx.fillText(i, x2+10, y2-h+3);
    ctx.stroke();
  }

  var mxw = Math.log(10000);
  for (var i=1; i<=10000; i*=2){
    var w = Math.floor(Math.log(i) / mxw * (x2-x1));
    ctx.beginPath();
    if (i==16 || i== 256 || i==4096){
      ctx.moveTo(x2-w,y2);
      ctx.lineTo(x2-w,y2+8);
      ctx.fillText(i, x2-w-Math.log(i)*1.5, y2+20);
    } else {
      ctx.moveTo(x2-w,y2);
      ctx.lineTo(x2-w,y2+4);
    }
    ctx.stroke();
  }

  var p = Math.floor(mine/sum * 1000000) / 10000,
    h = ac==0? 0 : Math.floor(Math.log(ac) / mxh * (y2-y1));
  ctx.beginPath();
  ctx.moveTo(x1,y2-h); ctx.lineTo(x2,y2-h);
  ctx.font = "12px sans-serif";
  ctx.fillText('You are here', x1, y2-h-3);
  ctx.fillText('Percentile: ' + p, x1, y2-h+15);
  ctx.fillText('Frequency', x1, y2+35);
  ctx.fillText('Solved', x2+5, y1-5);
  ctx.strokeStyle = "#000";
  ctx.stroke();
  */
}
