import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Post, PostService }   from '../../post';
import { LoadingService }      from '../../loading';

@Component({
  selector: 'ww-user-posts',
  templateUrl: './user-posts.component.html',
  styleUrls: ['./user-posts.component.scss']
})
export class UserPostsComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  postsSubscription: Subscription;

  constructor(
    private postService: PostService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.postsSubscription = this.postService.updatePost.subscribe(
      result =>  {
        this.posts = Object.keys(result).map(key => result[key]);
        this.loadingService.setLoader(false, "");
      })
  }

  ngOnDestroy() {
    if(this.postsSubscription) this.postsSubscription.unsubscribe();
  }

}
