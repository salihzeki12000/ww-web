import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Post, PostService }   from '../../post';

@Component({
  selector: 'ww-user-posts',
  templateUrl: './user-posts.component.html',
  styleUrls: ['./user-posts.component.scss']
})
export class UserPostsComponent implements OnInit {
  posts: Post[] = [];
  postsSubscription: Subscription;

  constructor(private postService: PostService) { }

  ngOnInit() {
    this.postsSubscription = this.postService.updatePost.subscribe(
                                   result =>  {
                                     this.posts = Object.keys(result).map(key => result[key]);
                                   })
  }

}