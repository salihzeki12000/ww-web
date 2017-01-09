import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { PostService } from '../post.service';
import { UserService } from '../../user';

@Component({
  selector: 'ww-post-input',
  templateUrl: './post-input.component.html',
  styleUrls: ['./post-input.component.scss']
})
export class PostInputComponent implements OnInit {
  postForm: FormGroup;
  userId;
  username;
  currentUserSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private postService: PostService) {
      this.postForm = formBuilder.group({
        content: ['', Validators.required],
        user: ['dd', Validators.required]
      })
  }

  onSubmit()  {
    this.postService.addPost({
      content: this.postForm.value.content,
      created_at: Date.now(),
      user: {
        userId: this.userId,
        username: this.username
      }
      })
     .subscribe(
       data => console.log(data),
       error => console.error(error)
     );
    //  this.postForm.reset();
  }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         data => {
                                           this.userId = data['id'];
                                           this.username = data['username'];
                                         }
                                       )
  }

}
