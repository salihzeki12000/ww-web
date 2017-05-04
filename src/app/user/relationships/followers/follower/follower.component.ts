import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ww-follower',
  templateUrl: './follower.component.html',
  styleUrls: ['./follower.component.scss']
})
export class FollowerComponent implements OnInit {
  @Input() follower;

  removeFollower = false;

  constructor() { }

  ngOnInit() {
  }

  remove()  {
    this.removeFollower = true;
  }

  cancelRemove()  {
    this.removeFollower = false;
  }

}
