import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { PostService } from '../post.service';
import { User, UserService } from '../../user';
import { FlashMessageService } from '../../flash-message';

@Component({
  selector: 'ww-post-input',
  templateUrl: './post-input.component.html',
  styleUrls: ['./post-input.component.scss']
})
export class PostInputComponent implements OnInit {
  postForm: FormGroup;
  currentUser: User;

  currentUserSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private flashMessageService: FlashMessageService,
    private postService: PostService) {
      this.postForm = formBuilder.group({
        content: ['', Validators.required],
        user: ['dd', Validators.required]
      })
  }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         data => {
                                           this.currentUser = data;
                                         }
                                       )
  }

  onSubmit()  {
    this.postService.addPost({
      content: this.postForm.value.content,
      created_at: Date.now(),
      user: {
        userId: this.currentUser['id'],
        username: this.currentUser['username']
      }
      })
     .subscribe(
       data =>  {
         this.flashMessageService.handleFlashMessage(data.message);
       }
     );
     this.postForm.reset();
  }

}
