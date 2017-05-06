import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { Post }                from '../post';
import { PostService }         from '../post.service';
import { FlashMessageService } from '../../flash-message';
import { UserService }         from '../../user/user.service';
import { CommentService }      from '../../shared';

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

  userLike;
  initialLike;
  likeCount;

  commentCount;
  commentForm: FormGroup;

  seeLikes;
  seeComments;
  showMenu = false;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private commentService: CommentService,
    private flashMessageService: FlashMessageService,
    private formBuilder: FormBuilder) {
      this.commentForm = this.formBuilder.group({
        comment: '',
      })
    }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                           this.checkSameUser();
                                           this.checkLikePost();
                                         }
                                       )
  }

  checkSameUser() {
    if(this.currentUser['id'] === this.post['user']['_id']) {
      this.sameUser = true;
    }
  }

  checkLikePost() {
    for (let i = 0; i < this.post['likes'].length; i++) {
      if(this.post['likes'][i]['_id'] === this.currentUser['id']) {
        this.userLike = true;
        i = this.post['likes'].length;
      }
    }

    if(this.post['likes'].length > 1) {
      this.likeCount = 'Likes'
    } else  {
      this.likeCount = 'Like'
    }

    if(this.post['comments'].length > 1) {
      this.commentCount = 'Comments'
    } else  {
      this.commentCount = 'Comment'
    }
  }

  onEdit()  {
    this.editing = true;
  }

  updatePost(editedPost: string)  {
    editedPost = editedPost.trim();
    this.post['content'] = editedPost;
    this.editing = false;

    this.editPost();
  }

  likePost()  {
    if(this.userLike) {
      for (let i = 0; i < this.post['likes'].length; i++) {
        if(this.post['likes'][i]['_id'] === this.currentUser['id'])  {
          this.post['likes'].splice(i,1)
        }
      }
    } else if(!this.userLike) {
      this.post['likes'].push({
        _id: this.currentUser['id'],
        display_picture: this.currentUser['display_picture'],
        description: this.currentUser['description'],
        username: this.currentUser['username']
      })
    }

    this.userLike = !this.userLike;

    if(this.post['likes'].length > 1) {
      this.likeCount = 'Likes'
    } else  {
      this.likeCount = 'Like'
    }

    this.editPost();
  }

  commentPost(comment)  {
    let newComment = {
      comment: comment,
      user: this.currentUser['id'],
      post: this.post['_id']
    }

    if(this.post['comments'].length > 1) {
      this.commentCount = 'Comments'
    } else  {
      this.commentCount = 'Comment'
    }
    this.commentService.addComment(newComment)
        .subscribe(
          result => {
            this.post['comments'].push(result);

            for (let i = 0; i < this.post['comments'].length; i++) {
              let units = [
                { name: "MINUTE", in_seconds: 60, limit: 3600 },
                { name: "HOUR", in_seconds: 3600, limit: 86400 },
                { name: "DAY", in_seconds: 86400, limit: 604800 },
                { name: "WEEK", in_seconds: 604800, limit: 2629743 },
                { name: "MONTH", in_seconds: 2629743, limit: 31556926 },
                { name: "YEAR", in_seconds: 31556926, limit: null }
              ];

              let timePosted = new Date(this.post['comments'][i]['created_at']).getTime();
              let timeDiff = (Date.now() - timePosted) / 1000;

              if(timeDiff < 60) {
                this.post['comments'][i]['time_ago'] = "Less than a minute ago";
              } else  {
                for (let j = 0; j < units.length; j++) {
                  if(timeDiff < units[j]['limit'] || !units[j]['limit'])  {
                    let timeAgo = Math.floor(timeDiff / units[j].in_seconds);
                    this.post['comments'][i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "S" : "") + " AGO";
                    j = units.length;
                  }
                }
              }
            }
            this.seeComments = true;
          })

    this.commentForm.reset();
  }

  editPost()  {
    this.postService.editPost(this.post)
        .subscribe(
          data =>  {
          }
        )
  }

  onDelete()  {
    this.postService.deletePost(this.post)
        .subscribe(
          data =>  {
            this.flashMessageService.handleFlashMessage(data.message);
          }
        )
  }

  showMenuOptions() {
    this.showMenu = true;
  }

  showComments()  {
    this.seeComments = !this.seeComments;
  }

  showLikes()  {
    this.seeLikes = true;
  }
}
