import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';

import { PostService }         from '../post.service';
import { User }                from '../../user/user'
import { UserService }         from '../../user/user.service';
import { FileuploadService }   from '../../shared'
import { FlashMessageService } from '../../flash-message';
import { LoadingService }      from '../../loading';

@Component({
  selector: 'ww-post-input',
  templateUrl: './post-input.component.html',
  styleUrls: ['./post-input.component.scss']
})
export class PostInputComponent implements OnInit, OnDestroy {
  postForm: FormGroup;
  currentUser: User;
  currentUserSubscription: Subscription;

  placeholder = "been wondering wandering?"

  textArea = false;
  fetchLink = false;
  linkExist = false;
  link_url;
  link_title;
  link_img;

  inputValue = '';
  fileTypeError = false;
  postPic;
  newImageFile = '';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private fileuploadService: FileuploadService,
    private flashMessageService: FlashMessageService,
    private loadingService: LoadingService,
    private postService: PostService) {
      this.postForm = formBuilder.group({
        content: ['', Validators.required],
        user: ['dd', Validators.required]
      })
  }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      data => { this.currentUser = data; })
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  onSubmit()  {
    this.loadingService.setLoader(true, "Saving...");

    if(this.newImageFile !== '') {
      this.fileuploadService.uploadFile(this.newImageFile).subscribe(
        result => { this.addPost(result); })
    } else  {
      this.addPost("");
    }
  }

  addPost(result) {
    this.postService.addPost({
      content: this.postForm.value.content,
      created_at: Date.now(),
      img: result.secure_url,
      public_id: result.public_id,
      link_title: this.link_title,
      link_url: this.link_url,
      link_img: this.link_img,
      user: {
        _id: this.currentUser['_id'],
        username: this.currentUser['username']
      },
    }).subscribe(
       data =>  {
         this.loadingService.setLoader(false, "");
         this.flashMessageService.handleFlashMessage(data.message);

         this.placeholder = "been wondering wandering?";
         this.inputValue = null;
         this.postPic = '';
         this.newImageFile = '';
         this.textArea = false;
         this.linkExist = false;
         this.link_url = '';
         this.link_title = '';
         this.link_img = '';
         this.postForm.reset();
       }
     );
  }

  cancelPost()  {
    this.textArea = false;
    this.linkExist = false;
    this.link_url = '';
    this.link_title = '';
    this.link_img = '';

    this.placeholder = "been wondering wandering?"

    this.postForm.reset();
  }

  checkLink(content) {
    if(!this.postPic) {
      let texts = content.split(" ");

      for (let i = 0; i < texts.length; i++) {
        if(texts[i].match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)) {
          this.fetchLink = true;

          this.linkExist = true;
          this.link_url = texts[i];

          this.postService.getPreview({link:texts[i]}).subscribe(
            result => {

              if(result.title)  this.link_title = result.title.trim();
              if(result.meta_img) this.link_img = result.meta_img.trim();

              this.fetchLink = false;
            },
            error => {
              this.fetchLink = false;
            }
          );
        }
      }
    }
  }

  deleteLink()  {
    this.linkExist = false;
    this.link_url = '';
    this.link_title = '';
    this.link_img = '';
  }

  fileUploaded(event) {
    this.textArea = true;
    this.linkExist = false;
    this.link_url = '';
    this.link_title = '';
    this.link_img = '';

    let file = event.target.files[0];
    let type = file['type'].split('/')[0]

    if (type !== 'image') {
      this.fileTypeError = true;
    } else  {
      if(event.target.files[0]) {
        this.newImageFile = event.target.files[0];
        let reader = new FileReader();

        reader.onload = (event) =>  {
          this.postPic = event['target']['result'];
        }

        this.placeholder = "and so... a picture is worth a thousand words?"

        reader.readAsDataURL(event.target.files[0]);
        return;
      }
    }
  }

  deletePicture() {
    this.placeholder = "back to wondering wandering...";
    this.inputValue = null;
    this.postPic = '';
    this.newImageFile = '';
  }

}
