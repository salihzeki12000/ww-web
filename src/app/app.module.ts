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
import { MainNavigationComponent } from './navigation';

import { UserComponent, UserService, ProfileComponent, ProfileDetailsComponent, ProfileEditComponent, RelationshipService, RelationshipsComponent, FollowingsComponent, FollowingComponent, FollowersComponent, FollowerComponent, RequestedFollowingsComponent, RequestedFollowingComponent, PendingFollowerComponent, PendingFollowersComponent } from './user';

import { PostsComponent, PostComponent, PostInputComponent, PostListComponent, PostService } from './post';

import { ItineraryComponent, ItineraryListComponent, ItineraryFormComponent, ItineraryAccommodationComponent, ItineraryTransportComponent, ItineraryService, ItineraryActivityComponent, ItineraryResourcesComponent, ResourceInputComponent, ResourceService, ResourceListComponent, ResourceComponent, ItineraryMapComponent, AccommodationFormComponent, TransportFormComponent, ItineraryEventService, ActivityComponent, ActivityListComponent, ActivityInputComponent, AccommodationComponent, TransportComponent, ItineraryPrintComponent, ItineraryPrintDatePreviewComponent, ItineraryPrintCategoryPreviewComponent, ItinerarySummaryComponent, ItineraryPrintCategoryComponent, ItineraryPrintDateComponent, ItinerarySettingsComponent, ItineraryShareComponent, ItineraryAllComponent, ItineraryPastComponent, ItineraryUpcomingComponent } from './itinerary';

import { GooglePlaceSearchComponent, GoogleCheckinComponent } from './google-api';

import { FlashMessageComponent, FlashMessageService } from './flash-message';
import { NotificationComponent, NotificationsComponent, NotificationListComponent, NotificationService } from './notifications';

import { AdminComponent } from './admin';
import { AttractionsComponent } from './attractions/attractions.component';
import { AdminAttractionComponent,AdminAttractionFormComponent } from './admin/admin-attraction';

import { FileuploadService, CommentService } from './shared';
import { LoadingComponent, LoadingService } from './loading';
import { ErrorMessageComponent, ErrorMessageService } from './error-message';

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
    ItineraryListComponent,
    ItineraryShareComponent,
    LoadingComponent,
    ErrorMessageComponent,
    ItineraryAllComponent,
    ItineraryPastComponent,
    ItineraryUpcomingComponent,
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
  providers: [ LoadingService, AuthService, UserService, PostService, ItineraryService, ItineraryEventService, ResourceService, FlashMessageService, RelationshipService, NotificationService, FileuploadService, CommentService, ErrorMessageService, AuthGuard ],
  bootstrap: [AppComponent]
})
export class AppModule { }
