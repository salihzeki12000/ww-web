import { Component, OnInit, OnDestroy, OnChanges, Input, Renderer2, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';

declare var google:any;

import { ItineraryEventService } from '../../itinerary-events/itinerary-event.service';
import { FlashMessageService }   from '../../../flash-message';
import { UserService }           from '../../../user';
import { LoadingService }        from '../../../loading';

@Component({
  selector: 'ww-itinerary-summary-transport',
  templateUrl: './itinerary-summary-transport.component.html',
  styleUrls: ['./itinerary-summary-transport.component.scss']
})
export class ItinerarySummaryTransportComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('map') map: ElementRef;
  transportMap;

  @Input() event;
  @Input() preview;
  @Input() dateRange;
  @Input() itinerary;
  @Input() summary;


  currentUserSubscription: Subscription;
  currentUser;
  sameUser;

  itineraries = [];

  showMenu = false;
  copying = false;
  editing = false;
  deleteTransport = false;

  locations = [];

  editTransportForm: FormGroup;
  submitted = false;

  // time picker
  ats = true;
  initHourDep = "";
  initMinuteDep = "";
  timePickerDep = false;
  hourDep = "";
  minuteDep = "";

  initHourArr = "";
  initMinuteArr = "";
  timePickerArr = false;
  hourArr = "";
  minuteArr = "";

  // manage arrival date
  outDateRange = [];
  outRange = [];
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  dayWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private userService: UserService,
    private itineraryEventService: ItineraryEventService,
    private loadingService: LoadingService,
    private flashMessageService: FlashMessageService,
    private formBuilder: FormBuilder) {
      this.editTransportForm = this.formBuilder.group({
        'reference_number': '',
        'dep_terminal': '',
        'arr_terminal': '',
        'dep_station': '',
        'arr_station': '',
        'dep_city': ['', Validators.required],
        'arr_city': ['', Validators.required],
        'dep_date': ['', Validators.required],
        'dep_time': '',
        'arr_date': ['', Validators.required],
        'arr_time': '',
        'transport_company': '',
        'contact_number': '',
        'note': '',
      })
    }

  ngOnInit()  {
    this.currentUserSubscription = this.userService.updateCurrentUser.subscribe(
      result => {
        this.currentUser = result;
        this.checkSameUser();
        this.filterItineraries();
      })

    this.event['formatted_note'] = this.event['note'].replace(/\r?\n/g, '<br/> ');
    this.initTime();
    this.sortDateRange();
  }

  ngOnChanges() {
    this.setLocations();
    this.initMap();
  }

  @HostListener('document:click', ['$event'])
  checkClick(event) {
    if(!event.target.classList.contains("dots-menu")) {
      this.showMenu = false;
    }

    if(!event.target.classList.contains("time-picker-dropdown") &&
      !event.target.classList.contains("time") &&
      !event.target.classList.contains("time-select") &&
      !event.target.classList.contains("selected-time")) {
      this.timePickerDep = false;
      this.timePickerArr = false;
    }
  }

  ngOnDestroy() {
    if(this.currentUserSubscription) this.currentUserSubscription.unsubscribe();
  }

  setLocations()  {
    this.locations = [];

    this.locations[0] = this.event['dep_station_location'];
    this.locations[1] = this.event['arr_station_location'];
  }

  checkSameUser() {
    if(this.currentUser['_id'] === this.event['user']['_id']) {
      this.sameUser = true;
    } else  {
      let admin = this.itinerary['admin'];
      for (let i = 0; i < admin.length; i++) {
        if(this.currentUser['_id'] === admin[i]) {
          this.sameUser = true;
          i = admin.length;
        }
      }
    }
  }

  filterItineraries() {
    this.itineraries = [];
    for (let i = 0; i < this.currentUser['itineraries'].length; i++) {
      if(this.currentUser['itineraries'][i]['_id'] !== this.itinerary['_id'])  {
        this.itineraries.push(this.currentUser['itineraries'][i])
      }
    }
  }

  initTime()  {
    if(this.event['dep_time'] === 'anytime') {
      this.hourDep = 'anytime';
      this.minuteDep = "00";
    } else  {
      this.hourDep = this.event['dep_time'].slice(0,2);
      this.minuteDep = this.event['dep_time'].slice(3,6);
    }

    this.initHourDep = this.hourDep;
    this.initMinuteDep = this.minuteDep;


    if(this.event['arr_time'] === 'anytime')  {
      this.hourArr = 'anytime';
      this.minuteArr = "00";
    } else  {
      this.hourArr = this.event['arr_time'].slice(0,2);
      this.minuteArr = this.event['arr_time'].slice(3,6);
    }

    this.initHourArr = this.hourArr;
    this.initMinuteArr = this.minuteArr;
  }


  // init map
  initMap() {
    let mapDiv = this.map.nativeElement;

    this.transportMap = new google.maps.Map(mapDiv, {
      center: {lat: 0, lng: 0 },
      zoom: 2,
      styles: [{"stylers": [{ "saturation": -20 }]}]
    });

    this.setMarkers(this.transportMap);
  }

  setMarkers(map) {
    let eventMarker = [];
    let icon = "https://res.cloudinary.com/wwfileupload/image/upload/v1507186249/orange_marker2_ltrumz.png";
    let color = "#FFA15C";
    let path = [];
    let bounds  = new google.maps.LatLngBounds();

    for (let i = 0; i < this.locations.length; i++) {
      let marker = new google.maps.Marker({
        position: {lat: this.locations[i]['lat'], lng: this.locations[i]['lng'] },
        map: map,
        icon: {
          url: icon,
          labelOrigin: new google.maps.Point(16, 16)
        },
        title: this.locations[i]['name'],
        label: {
          text: this.locations[i]['name'].charAt(0),
          color: color
        }
      })

      path.push({lat: this.locations[i]['lat'], lng: this.locations[i]['lng']})

      let loc = new google.maps.LatLng(this.locations[i]['lat'], this.locations[i]['lng']);
      bounds.extend(loc);
    }

    let lineSymbol = {
      path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
    };

    let travelPath = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: "#FFA15C",
      strokeOpacity: 1,
      strokeWeight: 3,
      icons: [{
        icon: lineSymbol,
        offset: '100%'
      }],
    })

    travelPath.setMap(map);
    map.fitBounds(bounds);
    map.panToBounds(bounds);
  }


  // manage dates for arrival
  sortDateRange() {
    this.outRange = [];

    for (let i = 0; i < this.dateRange.length; i++) {
      if(this.itinerary['num_days'])  {
        this.outRange.push({
          formatted: this.dateRange[i],
          date: this.dateRange[i],
        });
      } else  {
        if(this.dateRange[i] ===' any day') {
          this.outRange.push({
            formatted: this.dateRange[i],
            date: this.dateRange[i],
          })
        } else  {
          let ndate = new Date(this.dateRange[i])
          let year = ndate.getFullYear();
          let month = ndate.getMonth();
          let date = ndate.getDate();
          let day = ndate.getDay();

          let fdate;
          if(date < 10) {
            fdate = '0' + date;
          } else{
            fdate = date
          }

          this.outRange.push({
            formatted:"Day " + i + ", " + fdate + " " + this.months[month] + " " + year + " (" + this.dayWeek[day] + ")",
            date: this.dateRange[i]
          })
        }
      }
    }

    this.filterOutRange();
  }

  filterOutRange()  {
    if(this.event['dep_date'] === 'any day')  {
      this.outDateRange = [{formatted: 'any day', date: 'any day'}];
    } else  {
      let index = this.dateRange.indexOf(this.event['dep_date']);
      this.outDateRange = this.outRange.slice(index);
    }
  }

  dateChange()  {
    let inDate = this.editTransportForm.value.dep_date;
    let outDate = this.editTransportForm.value.arr_date;

    if(inDate === 'any day')  {
      this.outDateRange = [{formatted: 'any day', date: 'any day'}];
      this.editTransportForm.patchValue({
        arr_date: inDate,
      })
    } else  {
      let index = this.dateRange.indexOf(inDate);
      this.outDateRange = this.outRange.slice(index);

      if(inDate > outDate || outDate === 'any day')  {
        this.editTransportForm.patchValue({
          arr_date: inDate,
        })

        if(this.hourDep === 'anytime')  {
          this.hourArr = 'anytime'
        } else  {
          this.hourArr = this.hourDep;
          this.minuteArr = this.minuteDep;
        }
      }
    }
  }

  // copy section
  copy()  {
    this.copying = true;
    this.preventScroll(true);
  }

  cancelCopy()  {
    this.copying = false;
    this.preventScroll(false);
  }

  copyTo(itinerary) {
    let copiedEvent = this.event;

    delete copiedEvent['_id'];
    delete copiedEvent['created_at'];
    delete copiedEvent['itinerary'];

    copiedEvent['user'] ={
      _id: this.currentUser['_id'],
      username: this.currentUser['username'],
    }

    this.itineraryEventService.copyEvent(copiedEvent, itinerary).subscribe(
      result => {
        this.flashMessageService.handleFlashMessage(result.message);
      }
    )

    this.copying = false;
    this.preventScroll(false);
  }


  // edit section
  patchValue()  {
    this.editTransportForm.patchValue({
      reference_number: this.event['reference_number'],
      dep_city: this.event['dep_city'],
      arr_city: this.event['arr_city'],
      dep_terminal: this.event['dep_terminal'],
      arr_terminal: this.event['arr_terminal'],
      dep_station: this.event['dep_station'],
      arr_station: this.event['arr_station'],
      dep_date: this.event['dep_date'],
      arr_date: this.event['arr_date'],
      dep_time: this.event['dep_time'],
      arr_time: this.event['arr_time'],
      transport_company: this.event['transport_company'],
      contact_number: this.event['contact_number'],
      note: this.event['note'],
    })
  }

  edit()  {
    this.patchValue();
    this.editing = true;
    this.preventScroll(true);
  }

  undoEdit()  {
    this.patchValue()
  }

  cancelEdit()  {
    this.editing = false;
    this.preventScroll(false);
  }


  // select departure time
  selectPickerDep()  {
    this.timePickerDep = true;
  }

  selectHourDep(h) {
    this.hourDep = h;
  }

  selectMinuteDep(m) {
    this.minuteDep = m;
  }

  // select arrival time
  selectPickerArr()  {
    this.timePickerArr = true;
  }

  selectHourArr(h) {
    this.hourArr = h;
  }

  selectMinuteArr(m) {
    this.minuteArr = m;
  }


  saveEdit()  {
    this.submitted = true;
    this.loadingService.setLoader(true, "Saving...");

    let editedTransport = this.editTransportForm.value;
    let originalTransport = this.event;

    if(this.hourDep === 'anytime')  {
      editedTransport['dep_time'] = 'anytime';
    } else  {
      editedTransport['dep_time'] = this.hourDep + ':' + this.minuteDep;
    }

    if(this.hourArr === 'anytime')  {
      editedTransport['arr_time'] = 'anytime';
    } else  {
      editedTransport['arr_time'] = this.hourArr + ':' + this.minuteArr;
    }

    for (var value in editedTransport) {
      originalTransport[value] = editedTransport[value];
    }

    originalTransport['date'] = originalTransport['dep_date'];
    originalTransport['time'] = originalTransport['dep_time'];

    this.itineraryEventService.editEvent(originalTransport).subscribe(
      result => {
        this.loadingService.setLoader(false, "");
        this.flashMessageService.handleFlashMessage(result.message);
      })

    this.submitted = false;
    this.editing = false;
    this.preventScroll(false);
    this.initTime()
  }


  // delete section
  delete() {
    this.deleteTransport = true;
    this.preventScroll(true);
  }

  cancelDelete()  {
    this.deleteTransport = false;
    this.preventScroll(false);
  }

  confirmDelete()  {
    this.itineraryEventService.deleteEvent(this.event).subscribe(
      result => {
        this.flashMessageService.handleFlashMessage(result.message);
      })

    this.deleteTransport = false;
    this.preventScroll(false);
  }


  // others
  preventScroll(value)  {
    if(value) {
      this.renderer.addClass(document.body, 'prevent-scroll');
    } else  {
      this.renderer.removeClass(document.body, 'prevent-scroll');
    }
  }

  routeToUser(id) {
    if(id === this.currentUser['_id']) {
      this.router.navigateByUrl('/me/home');
    } else  {
      this.router.navigateByUrl('/wondererwanderer/' + id)
    }
  }

}
