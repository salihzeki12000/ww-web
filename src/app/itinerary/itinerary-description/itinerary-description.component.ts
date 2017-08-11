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

  currentItinerarySubscription: Subscription;
  currentItinerary;

  currentUserSubscription: Subscription;
  currentUser;
  validUser = false;

  preview = false;
  editing = false;

  inputValue = '';
  uploadedPics = [];
  confirmPics = false;

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

    this.currentItinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result =>{
        this.currentItinerary = result;

        if(this.currentItinerary['description'])  {
          this.currentItinerary['formatted_description'] = this.currentItinerary['description']['content'].replace(/\r?\n/g, '<br/> ');
        } else  {
          this.currentItinerary['formatted_description'] = '';
        }

        this.sortPhotos()
;      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;

        setTimeout(() =>  {
          this.checkSameUser();
        }, 1000)
      })

    this.loadingService.setLoader(false, "");
  }

  ngOnDestroy() {
    if(this.currentItinerarySubscription) this.currentItinerarySubscription.unsubscribe();
  }

  sortPhotos()  {
    for (let i = 0; i < this.currentItinerary['description']['photos'].length; i++) {
      this.currentItinerary['description']['photos'][i]['status'] = true;
    }
  }

  checkSameUser() {
    if(this.currentItinerary['created_by']['_id'] === this.currentUser['_id'])  {
      this.validUser = true;
    }
  }

  fileUploaded(event) {
    this.uploadedPics = [];
    let files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();

      reader.onload = (event) =>  {
        this.uploadedPics.push({
          file: files[i],
          url: event['target']['result'],
          status: true
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
    this.loadingService.setLoader(true, "Saving pictures...");
    this.confirmPics = false;

    for (let i = 0; i < this.currentItinerary['description']['photos'].length; i++) {
      if(!this.currentItinerary['description']['photos'][i]['status'])  {
        this.currentItinerary['description']['photos'].splice(i,1);
      }
    }

    for (let i = 0; i < this.uploadedPics.length; i++) {
      if(this.uploadedPics[i]['status'])  {
        this.fileuploadService.uploadFile(this.uploadedPics[i]['file'], "description").subscribe(
          result => {
            console.log(result)
            this.uploadedPics[i]['url'] = result.secure_url;
            this.uploadedPics[i]['public_id'] = result.public_id;
            this.uploadedPics[i]['credit'] = '';

            this.currentItinerary['description']['photos'].push(this.uploadedPics[i])
          }
        )
      }

      if(i === this.uploadedPics.length - 1)  {
        this.updateEdit();
      }
    }
  }

  updateEdit()  {
    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.uploadedPics = []
      })
  }

  save(content) {
    this.editing = false;

    this.currentItinerary['formatted_description'] = content.replace(/\r?\n/g, '<br/> ');
    this.currentItinerary['description']['content'] = content;

    this.itineraryService.editItin(this.currentItinerary, 'edit').subscribe(
      result => {})
  }

}
