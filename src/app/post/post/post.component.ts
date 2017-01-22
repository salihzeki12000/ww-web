import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs/Rx';

import { Post }                from '../post';
import { PostService }         from '../post.service';
import { FlashMessageService } from '../../flash-message';
import { UserService }         from '../../user';

@Component({
  selector: 'ww-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  @Input() post: Post;
  editing = false;

  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private flashMessageService: FlashMessageService) { }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                           this.checkSameUser();
                                         }
                                       )
  }

  checkSameUser() {
    if(this.currentUser['id'] === this.post['user']['_id']) {
      this.sameUser = true;
    }
  }

  onEdit()  {
    this.editing = true;
  }

  updatePost(post: Post, editedPost: string)  {
    editedPost = editedPost.trim();
    this.postService.editPost(post, editedPost)
        .subscribe(
          data =>  {
            this.flashMessageService.handleFlashMessage(data.message);
          }
        )
    this.editing = false;
  }

  onDelete()  {
    this.postService.deletePost(this.post)
        .subscribe(
          data =>  {
            this.flashMessageService.handleFlashMessage(data.message);
          }
        )
  }
}
