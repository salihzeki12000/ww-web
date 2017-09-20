import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';

import { UserService }           from '../../user';
import { ItineraryService }      from '../itinerary.service';
import { LoadingService }        from '../../loading';
import { FileuploadService }     from '../../shared';
import { FlashMessageService }   from '../../flash-message';

@Component({
  selector: 'ww-itinerary-description',
  templateUrl: './itinerary-description.component.html',
  styleUrls: ['./itinerary-description.component.scss']
})
export class ItineraryDescriptionComponent implements OnInit, OnDestroy {
  descriptionForm: FormGroup;

  itinerarySubscription: Subscription;
  itinerary;

  currentUserSubscription: Subscription;
  currentUser;

  preview = false;
  editing = false;
  managePics = false;
  picDeleted = false;

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
    private renderer: Renderer2,
    private formBuilder: FormBuilder,
    private flashMessageService: FlashMessageService,
    private fileuploadService: FileuploadService,
    private itineraryService: ItineraryService,
    private loadingService: LoadingService) {
      this.descriptionForm = this.formBuilder.group({
        'header': '',
        'link': '',
        'sections': this.formBuilder.array([])
      })
    }

  ngOnInit() {
    let segments = this.route.snapshot['_urlSegment'].segments;
    if(segments[0]['path'] === 'preview') this.preview = true;

    this.itinerarySubscription = this.itineraryService.currentItinerary.subscribe(
      result =>{
        this.itinerary = result;
        console.log(this.itinerary)
        this.descriptionForm.reset();
        this.patchValue();
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

  initSection(header, content)  {
    return this.formBuilder.group({
      section_header: header,
      section_content: content,
    })
  }

  addSection()  {
    const control = <FormArray>this.descriptionForm.controls['sections'];
    control.push(this.initSection('', ''));
  }

  removeSection(i)  {
    const control = <FormArray>this.descriptionForm.controls['sections'];
    control.removeAt(i);
  }

  patchValue()  {
    for (let i = 0; i < this.descriptionForm.value.sections.length; i++) {
      this.removeSection(i);
      i--;
    }

    this.descriptionForm.patchValue({
      header: this.itinerary['description']['header'],
      link: this.itinerary['link']
    })

    let sections = this.itinerary['description']['sections'];

    if(sections.length === 0) {
      this.initSection('','');
    } else  {

      for (let i = 0; i < sections.length; i++) {
        const control = <FormArray>this.descriptionForm.controls['sections'];
        let section = sections[i];
        section['formatted_content'] = section['section_content'].replace(/\r?\n/g, '<br/> ');
        control.push(this.initSection(section['section_header'], section['section_content']));
      }

      let formSection = this.descriptionForm.value.sections;
      let desSection = this.itinerary['description']['sections'];
      let diff = formSection.length - desSection.length;

      for (let i = 0; i < diff; i++) {
        this.removeSection(i);
      }

    }

  }



  sortPhotos()  {
    if(this.itinerary['description']['photos'])  {
      for (let i = 0; i < this.itinerary['description']['photos'].length; i++) {
        this.itinerary['description']['photos'][i]['status'] = true;
        this.itinerary['description']['photos'][i]['order'] = i + 1;
      }
    }
  }



  // manage pictures

  managePictures()  {
    this.managePics = true;
    this.preventScroll(true);
  }

  cancelManage()  {
    this.managePics = false;
    this.preventScroll(false);
  }


  // update existing

  updateStatus(image) {
    image.status = !image.status;

    for (let i = 0; i < this.itinerary['description']['photos'].length; i++) {
      if(!this.itinerary['description']['photos'][i]['status'])  {
        this.picDeleted = true;
        i = this.itinerary['description']['photos'].length;
      } else  {
        this.picDeleted = false;
      }
    }

  }

  saveChanges() {
    this.loadingService.setLoader(true, "Saving changes...");

    for (let i = 0; i < this.itinerary['description']['photos'].length; i++) {
      if(!this.itinerary['description']['photos'][i]['status'])  {
        this.itinerary['description']['photos'].splice(i,1);
        i--;
      }
    }

    this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage("Changes to pictures updated");
      })

    this.managePics = false;
    this.sortPhotos();
  }




  // upload pictures

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
          order: this.itinerary['description']['photos'].length + i + 1,
        });

      }

      reader.readAsDataURL(files[i]);
    }

    this.confirmPics = true;
    this.managePics = false;
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
        i--;
      }
    }

    for (let i = 0; i < this.uploadedPics.length; i++) {
      if(this.uploadedPics[i]['status'])  {
        this.fileuploadService.uploadFile(this.uploadedPics[i]['file'], "description").subscribe(
          result => {

            let newPic = {
              url: result.secure_url,
              public_id: result.public_id,
              credit: '',
            }

            if(this.itinerary['description']['photos'].length < 10) {
              this.itinerary['description']['photos'].push(newPic);
            } else  {
              i = this.uploadedPics.length;
            }
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
          this.flashMessageService.handleFlashMessage("Changes to pictures updated");
        })
    }

    this.sortPhotos();
  }




  // edit description

  onSubmit() {
    this.editing = false;
    this.itinerary['description']['header'] = this.descriptionForm.value.header;
    this.itinerary['description']['sections'] = this.descriptionForm.value.sections;
    this.itinerary['link'] = this.descriptionForm.value.link;

    this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
      result => {
        this.flashMessageService.handleFlashMessage("Description updated");
      })
  }


  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

}
