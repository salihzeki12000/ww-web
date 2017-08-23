import { Component, OnInit, Input } from '@angular/core';

import { Post } from '../post';

@Component({
  selector: 'ww-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  @Input() posts = [];

  constructor() { }

  ngOnInit() {
  }

}
