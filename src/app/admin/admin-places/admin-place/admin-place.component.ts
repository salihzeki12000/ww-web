import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

declare var google:any;

import { PlaceService }      from '../../../places';
import { LoadingService }    from '../../../loading';
import { AdminService }      from '../../admin.service';
import { CityService }       from '../../../cities';
import { FileuploadService } from '../../../shared';

@Component({
  selector: 'ww-admin-place',
  templateUrl: './admin-place.component.html',
  styleUrls: ['./admin-place.component.scss']
})
export class AdminPlaceComponent implements OnInit {
  @ViewChild('map') map: ElementRef;
  mapPosition;
  lat;
  lng;

  place;
  updated;
  placeForm: FormGroup;
  formatted_hours = '';
  pictureOptions = [];
  placeID;
  reviews = [];
  cities;
  citiesName;
  cityName;

  showContactDetails6 = false;
  showContactDetails3 = false;

  details = true;

  currentAdminSubscription: Subscription;
  admin;

  uploadedPics = [];
  inputValue = '';
  tracker = 0;

  constructor(
    private cityService: CityService,
    private adminService: AdminService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private placeService: PlaceService,
    private fileuploadService: FileuploadService,
    private route: ActivatedRoute) {
      this.placeForm = this.formBuilder.group({
        'name': '',
        'country': '',
        'city': '',
        'categories': '',
        'description': '',
        'long_description': '',
        'tips': '',
        'opening_hours': '',
        'entry_fee': '',
        'website': '',
        'formatted_address': '',
        'lat': '',
        'lng': '',
        'international_phone_number':'',
        'place_id': '',
        'getting_there':'',
      })
    }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      let id = params['id'];

      this.placeService.getPlace(id).subscribe(
        result => {
          this.place = result.place;
          this.patchValue();
        }
      )
    })

    this.currentAdminSubscription = this.adminService.updateCurrentAdmin.subscribe(
      result => { this.admin = result; }
    )

    this.cityService.getCities().subscribe(
      result => {
        this.cities = result.cities;
        this.getCitiesName();
      }
    )
  }

  getCitiesName() {
    this.citiesName = [];
    for (let i = 0; i < this.cities.length; i++) {
      this.citiesName.push(this.cities[i]['name'] + ', ' + this.cities[i]['country']['name']);
    }
  }

  patchValue()  {
    this.lat = this.place['lat'];
    this.lng = this.place['lng'];
    this.initMap();

    this.pictureOptions = [];
    if(this.place['photos'])  {
      this.pictureOptions = this.place['photos'];
    }
    this.formatPhotos();

    this.placeID = this.place['place_id'];

    if(this.place['city'])  {
      this.cityName = this.place['city']['name'] + ', ' + this.place['country']['name'];
    }

    if(this.place['opening_hours']) {
      this.formatted_hours = this.place['opening_hours'].replace(/\r?\n/g, '<br/> ');
    }

    if(this.place['updated'].length > 0)  {
      this.updated = this.place['updated'][0];
    }

    this.placeForm.patchValue({
      name: this.place['name'],
      country: this.place['country'],
      city: this.cityName,
      description: this.place['description'],
      long_description: this.place['long_description'],
      tips: this.place['tips'],
      opening_hours: this.place['opening_hours'],
      entry_fee: this.place['entry_fee'],
      website: this.place['website'],
      formatted_address: this.place['formatted_address'],
      lat: this.place['lat'],
      lng: this.place['lng'],
      international_phone_number: this.place['international_phone_number'],
      place_id: this.place['place_id'],
      getting_there: this.place['getting_there'],
    })

  }

  initMap() {
    setTimeout(() =>  {

      let mapDiv = this.map.nativeElement;

      this.mapPosition = new google.maps.Map(mapDiv, {
        center: {lat: this.lat, lng: this.lng },
        zoom: 17,
        styles: [{"stylers": [{ "saturation": -20 }]}]
      });

      this.getReviews();

      let marker = new google.maps.Marker({
        position: {lat: this.lat, lng: this.lng },
        map: this.mapPosition
      })

    }, 100)
  }

  getReviews()  {
    let service = new google.maps.places.PlacesService(this.mapPosition);

    service.getDetails({placeId: this.placeID}, (place, status) =>  {

      if(place['reviews'])  {
        this.reviews = place['reviews'];
        this.formatReviews();
      }

      this.loadingService.setLoader(false, "");
    })
  }

  formatReviews() {
    for (let i = 0; i < this.reviews.length; i++) {
      this.reviews[i]['author'] = "<a href='" + this.reviews[i]['author_url'] + "' target='_blank'>" + this.reviews[i]['author_name'] + "</a>";
    }
  }

  formatPhotos()  {
    for (let i = 0; i < this.pictureOptions.length; i++) {
      this.pictureOptions[i]['status'] = true;
    }
  }

  logHours(h) {
    this.formatted_hours = h.replace(/\r?\n/g, '<br/> ');
  }

  reposition(i, j)  {
    this.pictureOptions.splice(j - 1, 0, this.pictureOptions.splice(i, 1)[0]);
  }

  getDetails()  {
    this.details = true;

    if(this.lat)  {
      this.initMap()
    }
  }

  // add/remove pictures
  //
  // updateStatus(photo) {
  //   photo.status = !photo.status;
  // }

  // upload pictures

  fileUploaded(event) {
    this.uploadedPics = [];
    let files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();

      reader.onload = (event) =>  {
        this.uploadedPics.push({
          file: files[i],
          url: event['target']['result'],
          status: true,
        });

      }

      reader.readAsDataURL(files[i]);
    }
  }


  savePics()  {
    this.tracker = 0;
    this.loadingService.setLoader(true, "Saving edit...");

    if(this.uploadedPics.length === 0 && this.pictureOptions.length === 0)  {
      this.submit();
    }

    for (let i = 0; i < this.pictureOptions.length; i++) {
      if(!this.pictureOptions[i]['status']) {

        if(this.pictureOptions[i]['public_id']) {
          this.fileuploadService.deleteFile(this.pictureOptions[i]['public_id']).subscribe(
            result => {}
          )
        }

        this.pictureOptions.splice(i,1);
        i--;
      }

      if((i+1 === this.pictureOptions.length) && (this.uploadedPics.length === 0))  {
        this.submit();
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
              status: true,
            }

            this.pictureOptions.unshift(newPic);
            this.tracker += 1;
            this.trackTracker();
          }
        )
      } else{
        this.tracker += 1;
        this.trackTracker();
      }
    }
  }

  trackTracker()  {
    if(this.tracker === this.uploadedPics.length) {
      this.submit();
    }
  }


  submit()  {
    let place = this.placeForm.value;

    for (let key in place) {
      this.place[key] = place[key];
    }

    this.place['photos'] = this.pictureOptions;

    let index = this.citiesName.indexOf(place['city']);
    this.place['city'] = this.cities[index];

    this.place['updated'].unshift({
      admin: this.admin['_id'],
      date: new Date()
    });

    this.updated = this.place['updated'][0];

    this.placeService.editPlace(this.place).subscribe(
      result => {
        this.uploadedPics = [];
        this.loadingService.setLoader(false, "");
      }
    )
  }

}
