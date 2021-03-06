import { Component, OnInit, OnDestroy, Renderer2, ElementRef, HostListener } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription }   from 'rxjs/Rx';
import { Title }          from '@angular/platform-browser';

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
  submitted = false;

  itinerarySubscription: Subscription;
  itinerary;

  currentUserSubscription: Subscription;
  currentUser;

  preview = false;
  showMenu = false;
  editing = false;
  managePics = false;
  picDeleted = false;

  inputValue = '';
  uploadedPics = [];
  limitMsg = false;
  exceedMsg = false;
  confirmPics = false;
  interval;
  captions = [];

  constructor(
    private titleService: Title,
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

        let header = ''
        if(this.preview) header = "Preview : ";

        let title = header + this.itinerary['name'] + " | Description";

        this.titleService.setTitle(title);

        this.descriptionForm.reset();
        this.patchValue();
        this.sortPhotos();
      })

    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => { this.currentUser = result; })

    this.loadingService.setLoader(false, "");
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("fa-cog")) {
      this.showMenu = false;
    }
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
    this.captions = [];
    if(this.itinerary['description']['photos'])  {
      for (let i = 0; i < this.itinerary['description']['photos'].length; i++) {
        let photo = this.itinerary['description']['photos'][i];
        photo['status'] = true;
        photo['order'] = i + 1;
        this.captions[i] = photo['caption'];
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

    for (let i = 0; i < this.captions.length; i++) {
      this.itinerary['description']['photos'][i]['caption'] = this.captions[i];
    }
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

  updateCaption(i, caption) {
    this.itinerary['description']['photos'][i]['caption'] = caption;
  }

  saveChanges() {
    this.submitted = true;
    this.loadingService.setLoader(true, "Saving changes...");

    for (let i = 0; i < this.itinerary['description']['photos'].length; i++) {
      if(!this.itinerary['description']['photos'][i]['status'])  {

        if(this.itinerary['description']['photos'][i]['public_id']) {
          this.fileuploadService.deleteFile(this.itinerary['description']['photos'][i]['public_id']).subscribe(
            result => {}
          )
        }

        this.itinerary['description']['photos'].splice(i,1);
        i--;
      }
    }

    this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage("Changes to pictures updated");
      })

    this.submitted = false;
    this.managePics = false;
    this.preventScroll(false);
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
          caption: ''
        });
      }

      reader.readAsDataURL(files[i]);
    }

    this.confirmPics = true;
    this.managePics = false;
    this.preventScroll(false);
  }

  createCaption(i, caption) {
    this.uploadedPics[i]['caption'] = caption;
  }

  cancelPics()  {
    this.confirmPics = false;
    this.uploadedPics = []
  }

  savePics()  {
    let tracker = 0;
    this.submitted = true;

    this.loadingService.setLoader(true, "Saving pictures...");
    this.confirmPics = false;

    for (let i = 0; i < this.itinerary['description']['photos'].length; i++) {
      if(!this.itinerary['description']['photos'][i]['status'])  {

        if(this.itinerary['description']['photos'][i]['public_id']) {
          this.fileuploadService.deleteFile(this.itinerary['description']['photos'][i]['public_id']).subscribe(
            result => {})
        }

        this.itinerary['description']['photos'].splice(i,1);
        this.updateEdit();
        i--;
      }
    }

    for (let i = 0; i < this.uploadedPics.length; i++) {
      if(this.uploadedPics[i]['status'])  {
        this.fileuploadService.uploadFile(this.uploadedPics[i]['file']).subscribe(
          result => {

            let newPic = {
              url: result.secure_url,
              public_id: result.public_id,
              credit: '',
              caption: this.uploadedPics[i]['caption']
            }

            if(this.itinerary['description']['photos'].length < 10) {
              this.itinerary['description']['photos'].push(newPic);
              this.updateEdit();
              tracker += 1;
            } else  {
              i = this.uploadedPics.length;
              tracker += 1;
            }
          }
        )
      } else  {
        tracker += 1;
      }
    }

    this.interval = setInterval(()  =>  {
      this.updateView(tracker);
    }, 2000)
  }

  updateEdit()  {
    this.itineraryService.updateItinUser(this.itinerary).subscribe(
      result => {})
  }

  updateView(tracker)  {
    if(tracker === this.uploadedPics.length)  {
      clearInterval(this.interval);
      this.loadingService.setLoader(false, "");
      this.flashMessageService.handleFlashMessage("Changes to pictures updated");
      this.sortPhotos();
      this.submitted = false;
    }
  }

  // edit description

  onSubmit() {
    this.submitted = true;
    this.editing = false;
    this.itinerary['description']['header'] = this.descriptionForm.value.header;
    this.itinerary['description']['sections'] = this.descriptionForm.value.sections;
    this.itinerary['link'] = this.descriptionForm.value.link;

    this.itineraryService.editItin(this.itinerary, 'edit').subscribe(
      result => {
        this.flashMessageService.handleFlashMessage("Description updated");
        this.submitted = false;
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
