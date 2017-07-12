import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Post } from '../post';
import { PostService } from '../post.service';

@Component({
  selector: 'ww-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  @Input() posts = [];

  constructor(private postService: PostService) { }

  ngOnInit() {
  }

}
