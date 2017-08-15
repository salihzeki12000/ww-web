import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';

import { UserService }           from '../../user';
import { ItineraryService }      from '../itinerary.service';
import { LoadingService }        from '../../loading';
import { FileuploadService }     from '../../shared';

@Component({
  selector: 'ww-itinerary-description',
  templateUrl: './itinerary-description.component.html',
  styleUrls: ['./itinerary-description.component.scss']
})
export class ItineraryDescriptionComponent implements OnInit, OnDestroy {

  itinerarySubscription: Subscription;
  itinerary;

  currentUserSubscription: Subscription;
  currentUser;

  preview = false;
  editing = false;

  inputValue = '';
  uploadedPics = [];
  limitMsg = false;
  exceedMsg = false;
  confirmPics = false;
  tracker = 0;

  constructor(
    private element: ElementRef,
    private userService: UserService,
    private route: ActivatedRoute,
    private fileuploadService: FileuploadService,
    private itineraryService: ItineraryService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    let segments = this.route.snapshot['_urlSegment'].segments;
    if(segments[0]['path'] === 'preview') this.preview = true;

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result =>{
        this.itinerary = result;

        if(this.itinerary['description'])  {
          this.itinerary['formatted_description'] = this.itinerary['description']['content'].replace(/\r?\n/g, '<br/> ');
        } else  {
          this.itinerary['formatted_description'] = '';
        }

        this.sortPhotos();
      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })

    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    if(this.itinerarySubscription) this.itinerarySubscription.unsubscribe();
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  sortPhotos()  {
    if(this.itinerary['description']['photos'])  {
      for (let i = 0; i < this.itinerary['description']['photos'].length; i++) {
        this.itinerary['description']['photos'][i]['status'] = true;
        this.itinerary['description']['photos'][i]['order'] = i + 1;
      }
    }
  }

  fileUploaded(event) {
    this.uploadedPics = [];
    let files = event.target.files;
    let limit = files.length;

    if(limit > 10) {
      limit = 10;
      this.limitMsg = true;
    }

    if(this.itinerary['description']['photos'].length + limit > 10) {
      this.exceedMsg = true;
    }

    for (let i = 0; i < limit; i++) {
      let reader = new FileReader();

      reader.onload = (event) =>  {
        this.uploadedPics.push({
          file: files[i],
          url: event['target']['result'],
          status: true,
          order: i + 1 + this.itinerary['description']['photos'].length
        });

      }

      reader.readAsDataURL(files[i]);
    }

    this.confirmPics = true;
  }

  cancelPics()  {
    this.confirmPics = false;
    this.uploadedPics = []
  }

  savePics()  {
    this.tracker = 0;
    this.loadingService.setLoader(true, "Saving pictures...");
    this.confirmPics = false;

    for (let i = 0; i < this.itinerary['description']['photos'].length; i++) {
      if(!this.itinerary['description']['photos'][i]['status'])  {
        this.itinerary['description']['photos'].splice(i,1);
      }
    }

    for (let i = 0; i < this.uploadedPics.length; i++) {
      if(this.uploadedPics[i]['status'])  {
        this.fileuploadService.uploadFile(this.uploadedPics[i]['file'], "description").subscribe(
          result => {
            this.uploadedPics[i]['url'] = result.secure_url;
            this.uploadedPics[i]['public_id'] = result.public_id;
            this.uploadedPics[i]['credit'] = '';

            this.itinerary['description']['photos'].push(this.uploadedPics[i]);
          }
        )
      }

      this.tracker += 1;
    }

    let delay = this.uploadedPics.length * 1200;
    setTimeout(() =>  {
      this.updateEdit();
    }, delay)
  }

  updateEdit()  {
    if(this.tracker === this.uploadedPics.length) {

      this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
        result => {
          this.loadingService.setLoader(false, "");
          this.uploadedPics = []
        })

    }
  }

  save(content) {
    this.editing = false;

    this.itinerary['formatted_description'] = content.replace(/\r?\n/g, '<br/> ');
    this.itinerary['description']['content'] = content;

    this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
      result => {})
  }

}
