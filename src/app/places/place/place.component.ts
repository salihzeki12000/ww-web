import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

declare var google:any;

import { PlaceService }   from '../place.service';
import { LoadingService } from '../../loading';
import { AdminService }   from '../../admin/admin.service';
import { CityService }    from '../../cities';

@Component({
  selector: 'ww-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss']
})
export class PlaceComponent implements OnInit {
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

  constructor(
    private cityService: CityService,
    private adminService: AdminService,
    private formBuilder: FormBuilder,
    private loadingService: LoadingService,
    private placeService: PlaceService,
    private route: ActivatedRoute) {
      this.placeForm = this.formBuilder.group({
        'name': '',
        'country': '',
        'city': '',
        'categories': '',
        'description': '',
        'sub_description': '',
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
          console.log(this.place)
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
    this.pictureOptions = this.place['photos'];
    this.placeID = this.place['place_id'];

    if(this.place['city'])  {
      this.cityName = this.place['city']['name'] + ", " + this.place['country']['name'];
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
      city: this.place['city'],
      description: this.place['description'],
      sub_description: this.place['sub_description'],
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

  onSubmit()  {
    this.loadingService.setLoader(true, "Saving place...");

    let place = this.placeForm.value;
    console.log(place)
    for (let key in place) {
      this.place[key] = place[key];
    }

    let index = this.citiesName.indexOf(place['city']);
    this.place['city'] = this.cities[index];
    console.log(this.place)
    this.place['updated'].unshift({
      admin: this.admin['_id'],
      date: new Date()
    });

    this.updated = this.place['updated'][0];

    this.placeService.editPlace(this.place).subscribe(
      result => {
        this.loadingService.setLoader(false, "");
      }
    )
  }

}
