import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { routing } from './app.routing';

import { AppComponent } from './app.component';

import { AuthComponent, AuthService, SignupComponent, SigninComponent } from './auth';
import { UserComponent, UserService } from './user';

import { MeComponent } from './me';
import { MainNavigationComponent, SideNavigationComponent } from './navigation';

import { PostsComponent, PostComponent, PostInputComponent, PostListComponent, PostService } from './post';

import { GoogleAPIComponent, GooglePlaceSearchComponent, GoogleCheckinComponent } from './google-api';

import { ItineraryComponent, ItineraryAccommodationTransportComponent, ItineraryEventsComponent, ItineraryService, ItineraryActivityComponent, ItineraryResourcesComponent, ResourceInputComponent, ResourceService, ResourceListComponent, ResourceComponent, ItineraryMapComponent, AccommodationFormComponent, TransportFormComponent, ItineraryEventService } from './itinerary';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    SignupComponent,
    SigninComponent,
    UserComponent,
    MeComponent,
    MainNavigationComponent,
    SideNavigationComponent,
    PostsComponent,
    PostInputComponent,
    PostListComponent,
    PostComponent,
    ItineraryComponent,
    ItineraryEventsComponent,
    ItineraryAccommodationTransportComponent,
    AccommodationFormComponent,
    TransportFormComponent,
    ItineraryActivityComponent,
    GoogleAPIComponent,
    GooglePlaceSearchComponent,
    GoogleCheckinComponent,
    ItineraryResourcesComponent,
    ResourceInputComponent,
    ResourceListComponent,
    ResourceComponent,
    ItineraryMapComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    routing,
  ],
  providers: [ AuthService, UserService, PostService, ItineraryService, ItineraryEventService, ResourceService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
