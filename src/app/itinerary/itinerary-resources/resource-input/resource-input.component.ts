import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService } from '../../itinerary.service';
import { ResourceService } from '../resource.service';
import { FlashMessageService } from '../../../flash-message';
import { UserService } from '../../../user';
import { PostService } from '../../../post';

@Component({
  selector: 'ww-resource-input',
  templateUrl: './resource-input.component.html',
  styleUrls: ['./resource-input.component.scss']
})
export class ResourceInputComponent implements OnInit {
  @Output() hideResourceForm = new EventEmitter();
  resourceForm: FormGroup;

  currentUserSubscription: Subscription;
  currentUser;

  itinerarySubscription: Subscription;
  itinerary;

  textArea = false;
  linkExist = false;
  link_url;
  link_title;
  link_description;
  link_img;

  constructor(
    private formBuilder: FormBuilder,
    private resourceService: ResourceService,
    private userService: UserService,
    private postService: PostService,
    private flashMessageService: FlashMessageService,
    private itineraryService: ItineraryService,
    private route: ActivatedRoute,
    private router: Router) {
      this.resourceForm = formBuilder.group({
        content: ['', Validators.required],
        title: '',
      })
  }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser
                                       .subscribe(
                                         result => {
                                           this.currentUser = result;
                                         })

    this.itinerarySubscription = this.itineraryService.currentItinerary
                                     .subscribe(
                                       result =>  {
                                         this.itinerary = result;
                                       }
                                     )
  }

  onSubmit()  {
    let resourceTitle;
    if(this.link_title && this.resourceForm.value.title === "") {
      resourceTitle = this.link_title;
    }
    if(this.resourceForm.value.title !== "")  {
      resourceTitle = this.resourceForm.value.title;
    }
    this.resourceService.addResource({
      content: this.resourceForm.value.content,
      title: resourceTitle,
      link_url: this.link_url,
      link_title: this.link_title,
      link_description: this.link_description,
      link_img: this.link_img,
      itinerary: this.itinerary,
      user: {
        _Id: this.currentUser['id'],
        username: this.currentUser['username'],
      },
      created_at: Date.now()
    })
    .subscribe(
      result => {
        if(this.route.snapshot['_urlSegment'].segments[3].path !== 'resources') {
          let id = this.route.snapshot['_urlSegment'].segments[2].path;
          this.router.navigateByUrl('/me/itinerary/' + id + '/resource');
        }
        this.flashMessageService.handleFlashMessage(result.message);
      }
    )

    this.hideResourceForm.emit(false);
    this.linkExist = false;
    this.link_url = '';
    this.link_title = '';
    this.link_description = '';
    this.link_img = '';
  }

  cancelForm()  {
    this.hideResourceForm.emit(false);
    this.linkExist = false;
    this.link_url = '';
    this.link_title = '';
    this.link_description = '';
    this.link_img = '';
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

                            if(result.description)  {
                              this.link_description = result.description.trim();
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
    this.link_description = '';
    this.link_img = '';
  }

}