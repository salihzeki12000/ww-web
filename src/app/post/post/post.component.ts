import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { Post }                from '../post';
import { PostService }         from '../post.service';
import { FlashMessageService } from '../../flash-message';
import { UserService }         from '../../user/user.service';
import { CommentService }      from '../../shared';
import { ErrorMessageService } from '../../error-message';

@Component({
  selector: 'ww-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy {
  @Input() post: Post;
  editing = false;
  deletePost = false;
  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  userLike;
  likeCount;
  likeUsers = [];

  commentCount;
  commentForm: FormGroup;
  deleteComment = -1;

  seeLikes;
  seeComments;
  showMenu = false;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private commentService: CommentService,
    private flashMessageService: FlashMessageService,
    private errorMessageService: ErrorMessageService,
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
                                           this.checkCommentSameUser();
                                         })

    this.post['formatted_content'] = this.post['content'].replace(/\r?\n/g, '<br/> ');
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("dots-menu")) {
      this.showMenu = false;
    }
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
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
      }
    }

    this.likeCount = "Like" + (this.post['likes'].length > 1 ? "s" : "")
    this.commentCount = "Comment" + (this.post['comments'].length > 1 ? "s" : "")
  }

  checkCommentSameUser()  {
    for (let i = 0; i < this.post['comments'].length; i++) {
      if(this.post['comments'][i]['user']['_id'] === this.currentUser['id'])  {
        this.post['comments'][i]['same_user'] = true;
      }
    }
  }

  updatePost(editedPost: string)  {
    editedPost = editedPost.trim();

    let emptyImg = this.post['img'] === '' || this.post['img'] === undefined;
    let emptyLink = this.post['link_url'] === '' || this.post['link_url'] === undefined;
    let emptyLinkImg = this.post['link_img'] === '' || this.post['link_img'] === undefined;

    if(editedPost.length === 0 && (emptyImg && emptyLink && emptyLinkImg)) {
      this.errorMessageService.handleErrorMessage({
        title: "Error: Empty content",
        error:  {
          message: "You do not have any content in your edited post. If you want to delete it, please select the delete option."
        }
      });
      this.editing = false;
    } else  {
      this.post['content'] = editedPost;
      this.editing = false;

      this.editPost();
    }

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
    this.likeCount = "Like" + (this.post['likes'].length > 1 ? "s" : "")

    this.editPost();
  }

  commentPost(comment)  {
    let newComment = {
      comment: comment,
      user: this.currentUser['id'],
      post: this.post['_id']
    }

    this.commentCount = "Comment" + (this.post['comments'].length > 1 ? "s" : "")

    this.commentService.addComment(newComment)
        .subscribe(
          result => {
            this.post['comments'].push(result);

            for (let i = 0; i < this.post['comments'].length; i++) {
              let units = [
                { name: "minute", in_seconds: 60, limit: 3600 },
                { name: "hour", in_seconds: 3600, limit: 86400 },
                { name: "day", in_seconds: 86400, limit: 604800 }
              ];

              let timePosted = new Date(this.post['comments'][i]['created_at']).getTime();
              let timeDiff = (Date.now() - timePosted) / 1000;

              if(timeDiff < 60) {
                this.post['comments'][i]['time_ago'] = "Less than a minute ago";
              } else if(timeDiff > 604800) {
                this.post['comments'][i]['time_ago'] = "";
              } else  {
                for (let j = 0; j < units.length; j++) {
                  if(timeDiff < units[j]['limit'])  {
                    let timeAgo = Math.floor(timeDiff / units[j].in_seconds);
                    this.post['comments'][i]['time_ago'] = timeAgo + " " + units[j].name + (timeAgo > 1 ? "s" : "") + " ago";
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
    this.deletePost = false;
  }

  confirmDeleteComment(i)  {
    this.deleteComment = i;
  }

  cancelDeleteComment() {
    this.deleteComment = -1;
  }

  onDeleteComment() {
    let comment = this.post['comments'][this.deleteComment];

    this.post['comments'].splice(this.deleteComment, 1);
    this.deleteComment = -1;

    this.postService.editPost(this.post).subscribe(
          data => {
            this.commentService.deleteComment(comment).subscribe(
              data => { }
            )
        })
  }
}
