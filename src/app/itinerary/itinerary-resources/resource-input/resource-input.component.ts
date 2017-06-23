import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import { ItineraryService }    from '../../itinerary.service';
import { ResourceService }     from '../resource.service';
import { FlashMessageService } from '../../../flash-message';
import { UserService }         from '../../../user';
import { PostService }         from '../../../post';

@Component({
  selector: 'ww-resource-input',
  templateUrl: './resource-input.component.html',
  styleUrls: ['./resource-input.component.scss']
})
export class ResourceInputComponent implements OnInit, OnDestroy {
  @Output() hideResourceForm = new EventEmitter();

  resourceForm: FormGroup;

  textArea = false;
  fetchLink = false;
  linkExist = false;
  link_url;
  link_title;
  link_description;
  link_img;

  currentUserSubscription: Subscription;
  currentUser;

  currentItinerarySubscription: Subscription;
  currentItinerary;

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
        content: '',
        title: '',
      })
  }

  ngOnInit() {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
                                        result => { this.currentUser = result; })

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
                                             result => { this.currentItinerary = result; })
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
    this.currentItinerarySubscription.unsubscribe();
  }

  // link preview
  checkLink(content) {
    let texts = content.split(" ");

    for (let i = 0; i < texts.length; i++) {
      if(texts[i].match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g)) {
        this.fetchLink = true;
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

                            this.fetchLink = false;
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

  // save
  saveNew()  {
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
      itinerary: this.currentItinerary,
      user: {
        _id: this.currentUser['_id'],
        username: this.currentUser['username'],
      },
      created_at: new Date()
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

}
