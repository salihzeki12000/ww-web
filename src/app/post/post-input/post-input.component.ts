import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { PostService } from '../post.service';
import { User } from '../../user/user'
import { UserService } from '../../user/user.service';
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

  textArea = false;
  linkExist = false;
  link_url;
  link_title;
  link_img;

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
      },
      link_title: this.link_title,
      link_url: this.link_url,
      link_img: this.link_img,
      })
     .subscribe(
       data =>  {
         this.flashMessageService.handleFlashMessage(data.message);
       }
     );

     this.textArea = false;
     this.linkExist = false;
     this.link_url = '';
     this.link_title = '';
     this.link_img = '';
     this.postForm.reset();
  }

  showTextArea()  {
    this.textArea = true;
  }

  cancelPost()  {
    this.textArea = false;
    this.linkExist = false;
    this.link_url = '';
    this.link_title = '';
    this.link_img = '';

    this.postForm.reset();
  }

  checkLink(content) {
    let texts = content.split(" ");

    for (let i = 0; i < texts.length; i++) {
      if(texts[i].match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)) {
        this.postService.getPreview({link:texts[i]})
                        .subscribe(
                          result => {
                            this.linkExist = true;
                            this.link_url = texts[i];
                            if(result.title)  {
                              this.link_title = result.title.trim();
                            }
                            if(result.meta_img) {
                              this.link_img = result.meta_img.trim();
                            }
                          }
                        );
      }
    }
  }

  deleteLink()  {
    this.linkExist = false;
    this.link_url = '';
    this.link_title = '';
    this.link_img = '';
  }

}
