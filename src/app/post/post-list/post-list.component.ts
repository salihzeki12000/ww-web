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
  @Input() posts: Post[] = [];
  // posts: Post[] = [];
  //
  // postsSubscription: Subscription;

  constructor(private postService: PostService) { }

  ngOnInit() {
    // this.postService.getPosts()
    //     .subscribe(
    //       result => {
    //         this.postsSubscription = this.postService.updatePost
    //                                      .subscribe(
    //                                        result =>  {
    //                                          this.posts = Object.keys(result).map(key => result[key]);
    //                                        }
    //                                      )
    //       }
    //     );
  }

}
