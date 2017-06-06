import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ww-follower',
  templateUrl: './follower.component.html',
  styleUrls: ['./follower.component.scss']
})
export class FollowerComponent implements OnInit {
  @Input() follower;

  removeFollower = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  routeToUser(id) {
    this.router.navigateByUrl('/wondererwanderer/' + id)
  }
}
