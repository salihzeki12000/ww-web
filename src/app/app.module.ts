import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { routing } from './app.routing';

import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular';

import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page';
import { AuthComponent, AuthService, SignupComponent, SigninComponent } from './auth';
import { AuthGuard } from './_guards/auth.guard';

import { HomeComponent } from './home';
import { MeComponent } from './me';

import { MainNavigationComponent, SideNavigationComponent } from './navigation';

import { UserComponent, UserService, ProfileComponent, ProfileDetailsComponent, ProfileEditComponent, RelationshipService, RelationshipsComponent, FollowingsComponent, FollowingComponent, FollowersComponent, FollowerComponent, RequestedFollowingsComponent, RequestedFollowingComponent, PendingFollowerComponent, PendingFollowersComponent } from './user';

import { PostsComponent, PostComponent, PostInputComponent, PostListComponent, PostService } from './post';

import { ItineraryComponent, ItineraryFormComponent, ItineraryAccommodationComponent, ItineraryTransportComponent, ItineraryService, ItineraryActivityComponent, ItineraryResourcesComponent, ResourceInputComponent, ResourceService, ResourceListComponent, ResourceComponent, ItineraryMapComponent, AccommodationFormComponent, TransportFormComponent, ItineraryEventService, ActivityComponent, ActivityListComponent, ActivityInputComponent, AccommodationComponent, TransportComponent, ItineraryPrintComponent, ItineraryPrintDatePreviewComponent, ItineraryPrintCategoryPreviewComponent, ItinerarySummaryComponent, ItineraryPrintCategoryComponent, ItineraryPrintDateComponent, ItinerarySettingsComponent } from './itinerary';

import { GooglePlaceSearchComponent, GoogleCheckinComponent } from './google-api';

import { FlashMessageComponent, FlashMessageService } from './flash-message';
import { NotificationComponent, NotificationsComponent, NotificationListComponent, NotificationService } from './notifications';

import { AdminComponent } from './admin';
import { AttractionsComponent } from './attractions/attractions.component';
import { AdminAttractionComponent,AdminAttractionFormComponent } from './admin/admin-attraction';

export const cloudinaryLib = {
  Cloudinary: Cloudinary
};

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    SignupComponent,
    SigninComponent,
    UserComponent,
    ProfileComponent,
    ProfileDetailsComponent,
    FollowingComponent,
    MeComponent,
    MainNavigationComponent,
    SideNavigationComponent,
    PostsComponent,
    PostInputComponent,
    PostListComponent,
    PostComponent,
    ItineraryComponent,
    ItineraryFormComponent,
    ItineraryAccommodationComponent,
    ItineraryTransportComponent,
    AccommodationComponent,
    AccommodationFormComponent,
    TransportComponent,
    TransportFormComponent,
    ItineraryActivityComponent,
    ActivityComponent,
    ActivityListComponent,
    ActivityInputComponent,
    GooglePlaceSearchComponent,
    GoogleCheckinComponent,
    ItineraryPrintComponent,
    ItineraryPrintDatePreviewComponent,
    ItineraryPrintCategoryPreviewComponent,
    ItineraryPrintCategoryComponent,
    ItineraryPrintDateComponent,
    ItineraryResourcesComponent,
    ResourceInputComponent,
    ResourceListComponent,
    ResourceComponent,
    ItineraryMapComponent,
    FlashMessageComponent,
    NotificationComponent,
    NotificationsComponent,
    NotificationListComponent,
    ItinerarySummaryComponent,
    LandingPageComponent,
    AttractionsComponent,
    AdminComponent,
    AdminAttractionComponent,
    AdminAttractionFormComponent,
    HomeComponent,
    ProfileEditComponent,
    ItinerarySettingsComponent,
    RelationshipsComponent,
    FollowingsComponent,
    FollowersComponent,
    FollowerComponent,
    RequestedFollowingsComponent,
    RequestedFollowingComponent,
    PendingFollowerComponent,
    PendingFollowersComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    JsonpModule,
    routing,
    CloudinaryModule.forRoot(cloudinaryLib, { cloud_name: 'wwfileupload'}),
  ],
  providers: [ AuthService, UserService, PostService, ItineraryService, ItineraryEventService, ResourceService, FlashMessageService, RelationshipService, NotificationService, AuthGuard ],
  bootstrap: [AppComponent]
})
export class AppModule { }
