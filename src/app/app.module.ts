import { BrowserModule, Title }             from '@angular/platform-browser';
import { BrowserAnimationsModule }          from '@angular/platform-browser/animations'
import { NgModule }                         from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule }          from '@angular/http';
import { routing }                          from './app.routing';
import { Daterangepicker }                  from 'ng2-daterangepicker';

import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page';
import { AuthComponent, AuthService, SignupComponent, SigninComponent, ResetComponent, ForgotPasswordComponent } from './auth';
import { AuthGuard } from './_guards/auth.guard';

import { HomeComponent } from './home';
import { MeComponent } from './me';
import { MainNavigationComponent } from './navigation';

import { UserComponent, UserProfileCardComponent, UserCheckInComponent, UserFollowersComponent, UserFollowingsComponent, UserItinerariesComponent, UserItinerarySummaryComponent, UserPostsComponent, UserService, ProfileComponent, ProfileDetailsComponent, ProfileEditComponent } from './user';

import { RelationshipService, RelationshipsComponent, FollowingsComponent, FollowingComponent, FollowersComponent, FollowerComponent, RequestedFollowingsComponent, RequestedFollowingComponent, PendingFollowerComponent, PendingFollowersComponent } from './relationships';

import { PostsComponent, PostComponent, PostInputComponent, PostListComponent, PostService, PostDisplayComponent } from './post';

import { ItineraryComponent, ItineraryListComponent, ItineraryFormComponent, ItineraryInviteComponent, ItineraryAccommodationComponent, ItineraryTransportComponent, ItineraryService, ItineraryActivityComponent, ItineraryResourcesComponent, ResourceInputComponent, ResourceService, ResourceListComponent, ResourceComponent, ItineraryMapComponent, AccommodationFormComponent, TransportFormComponent, ItineraryEventService, ActivityComponent, ActivityListComponent, ActivityInputComponent, AccommodationComponent, TransportComponent, ItineraryPrintComponent, ItineraryPreviewComponent, ItinerarySummaryComponent, ItinerarySummaryDayComponent, ItinerarySettingsComponent, ItineraryShareComponent, ItineraryListItemComponent, ItineraryAllComponent, ItineraryPastComponent, ItineraryUpcomingComponent, ItineraryDescriptionComponent } from './itinerary';

import { GooglePlaceSearchComponent, GoogleCheckinComponent } from './google-api';

import { FlashMessageComponent, FlashMessageService } from './flash-message';
import { NotificationComponent, NotificationsComponent, NotificationListComponent, NotificationService } from './notifications';

import { AdminComponent } from './admin';
import { AttractionsComponent } from './attractions/attractions.component';
import { AdminAttractionComponent,AdminAttractionFormComponent } from './admin/admin-attraction';

import { FileuploadService, CommentService, TimePickerComponent } from './shared';
import { LoadingComponent, LoadingService } from './loading';
import { ErrorMessageComponent, ErrorMessageService } from './error-message';

import { PrivacyPolicyComponent } from './privacy-policy';
import { CheckInComponent, CheckInService } from './check-in';
import { CapitalisePipe } from './pipes';
import { LocationPinComponent } from './location-pin/location-pin.component';
import { RecommendationsComponent, RecommendationComponent, RecommendationDisplayComponent, RecommendationService, AddRecommendationComponent } from './recommendations';
import { PlaceComponent } from './place';

@NgModule({
  declarations: [
    CapitalisePipe,
    AppComponent,
    AuthComponent,
    SignupComponent,
    SigninComponent,
    ResetComponent,
    ForgotPasswordComponent,
    UserComponent,
    UserProfileCardComponent,
    UserCheckInComponent,
    UserFollowersComponent,
    UserFollowingsComponent,
    UserItinerariesComponent,
    UserItinerarySummaryComponent,
    UserPostsComponent,
    ProfileComponent,
    ProfileDetailsComponent,
    FollowingComponent,
    MeComponent,
    MainNavigationComponent,
    PostsComponent,
    PostInputComponent,
    PostListComponent,
    PostComponent,
    PostDisplayComponent,
    ItineraryComponent,
    ItineraryFormComponent,
    ItineraryInviteComponent,
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
    ItineraryPreviewComponent,
    ItineraryResourcesComponent,
    ResourceInputComponent,
    ResourceListComponent,
    ResourceComponent,
    ItineraryMapComponent,
    ItineraryDescriptionComponent,
    ItinerarySummaryComponent,
    ItinerarySettingsComponent,
    ItineraryListComponent,
    ItineraryShareComponent,
    ItineraryListItemComponent,
    ItineraryAllComponent,
    ItineraryPastComponent,
    ItineraryUpcomingComponent,
    ItinerarySummaryDayComponent,
    FlashMessageComponent,
    NotificationComponent,
    NotificationsComponent,
    NotificationListComponent,
    LandingPageComponent,
    AttractionsComponent,
    AdminComponent,
    AdminAttractionComponent,
    AdminAttractionFormComponent,
    HomeComponent,
    ProfileEditComponent,
    RelationshipsComponent,
    FollowingsComponent,
    FollowersComponent,
    FollowerComponent,
    RequestedFollowingsComponent,
    RequestedFollowingComponent,
    PendingFollowerComponent,
    PendingFollowersComponent,
    LoadingComponent,
    ErrorMessageComponent,
    TimePickerComponent,
    PrivacyPolicyComponent,
    CheckInComponent,
    LocationPinComponent,
    RecommendationDisplayComponent,
    PlaceComponent,
    RecommendationsComponent,
    RecommendationComponent,
    AddRecommendationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    JsonpModule,
    routing,
    Daterangepicker
  ],
  providers: [ Title, LoadingService, AuthService, UserService, PostService, ItineraryService, ItineraryEventService, ResourceService, FlashMessageService, RelationshipService, NotificationService, FileuploadService, CommentService, ErrorMessageService, CheckInService, RecommendationService, AuthGuard ],
  bootstrap: [AppComponent]
})
export class AppModule { }
