import { BrowserModule, Title }             from '@angular/platform-browser';
import { BrowserAnimationsModule }          from '@angular/platform-browser/animations'
import { NgModule, ErrorHandler }           from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule, JsonpModule }          from '@angular/http';
import { routing }                          from './app.routing';
import { Daterangepicker }                  from 'ng2-daterangepicker';
import { Ng2DeviceDetectorModule }          from 'ng2-device-detector';
import * as Raven from 'raven-js';

import { AppComponent }         from './app.component';
import { AuthGuard }            from './_guards/auth.guard';
import { AdminGuard }           from './_guards/admin.guard';

import { LandingPageComponent } from './landing-page';
import { AuthComponent, AuthService, SignupComponent, SigninComponent, ResetComponent, ForgotPasswordComponent } from './auth';

import { HomeComponent }           from './home';
import { MeComponent }             from './me';
import { MainNavigationComponent } from './navigation';

import { UserComponent, UserVerifyComponent, UserUnverifiedComponent, UserProfileCardComponent, UserFavouriteComponent, UserFollowersComponent, UserFollowingsComponent, UserItinerariesComponent, UserItinerarySummaryComponent, UserPostsComponent, UserService, ProfileComponent, ProfileDetailsComponent, ProfileEditComponent } from './user';

import { RelationshipService, RelationshipsComponent, FollowingsComponent, FollowingComponent, FollowersComponent, FollowerComponent, RequestedFollowingsComponent, RequestedFollowingComponent, PendingFollowerComponent, PendingFollowersComponent } from './relationships';

import { PostsComponent, PostComponent, PostInputComponent, PostListComponent, PostService, PostDisplayComponent } from './post';

import { ItineraryComponent, ItineraryListComponent, ItineraryFormComponent, ItineraryInviteComponent, ItineraryAccommodationComponent, ItineraryTransportComponent, ItineraryService, ItineraryActivityComponent, ItineraryResourcesComponent, ResourceInputComponent, ResourceService, ResourceListComponent, ResourceComponent, ItineraryMapComponent, AccommodationFormComponent, TransportFormComponent, ItineraryEventService, ActivityComponent, ActivityListComponent, ActivityInputComponent, AccommodationComponent, TransportComponent, ItineraryPrintComponent, ItineraryPreviewComponent, ItinerarySummaryComponent, ItinerarySummaryDayComponent, ItinerarySummaryCompressedComponent, ItinerarySettingsComponent, ItineraryShareComponent, ItineraryListItemComponent, ItineraryAllComponent, ItinerarySavedComponent, ItineraryCuratedComponent, ItineraryFollowingComponent, ItineraryDescriptionComponent } from './itinerary';

import { GooglePlaceSearchComponent, GoogleFavComponent } from './google-api';

import { FlashMessageComponent, FlashMessageService } from './flash-message';
import { NotificationComponent, NotificationsComponent, NotificationListComponent, NotificationService } from './notifications';

import { AdminComponent, AdminService, AdminLoginComponent, AdminVerifyComponent, AdminFormComponent, AdminCountriesComponent, AdminCitiesComponent } from './admin';
import { AttractionsComponent } from './attractions/attractions.component';
import { AdminAttractionComponent,AdminAttractionFormComponent } from './admin/admin-attraction';

import { FileuploadService, CommentService, TimePickerComponent } from './shared';
import { LoadingComponent, LoadingService } from './loading';
import { ErrorMessageComponent, ErrorMessageService } from './error-message';

import { FavouriteComponent, FavouriteService } from './favourite';
import { CapitalisePipe } from './pipes';
import { LocationPinComponent } from './location-pin/location-pin.component';
import { RecommendationsComponent, RecommendationComponent, RecommendationDisplayComponent, RecommendationService, AddRecommendationComponent } from './recommendations';
import { PlaceComponent, PlacesComponent, PlaceDisplayComponent, PlaceService } from './places';
import { CountriesComponent, CountryComponent, CountryService } from './countries';
import { CitiesComponent, CityService } from './cities';
import { AutoGrowDirective } from './directives/auto-grow.directive';
import { AboutUsComponent, ContactUsComponent, PrivacyPolicyComponent, TermsOfServiceComponent } from './basics';

Raven
  .config('https://5575c781e9054ddd828e3e4b8f90bc55@sentry.io/211359')
  .install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err:any) : void {
    Raven.captureException(err);
  }
}


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
    UserVerifyComponent,
    UserUnverifiedComponent,
    UserProfileCardComponent,
    UserFavouriteComponent,
    UserFollowersComponent,
    UserFollowingsComponent,
    UserItinerariesComponent,
    UserItinerarySummaryComponent,
    UserPostsComponent,
    ProfileComponent,
    ProfileDetailsComponent,
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
    GoogleFavComponent,
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
    ItinerarySavedComponent,
    ItineraryCuratedComponent,
    ItineraryFollowingComponent,
    ItinerarySummaryDayComponent,
    ItinerarySummaryCompressedComponent,
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
    FollowingComponent,
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
    FavouriteComponent,
    LocationPinComponent,
    RecommendationDisplayComponent,
    PlaceComponent,
    RecommendationsComponent,
    RecommendationComponent,
    AddRecommendationComponent,
    AdminLoginComponent,
    AdminVerifyComponent,
    AdminFormComponent,
    PlacesComponent,
    PlaceDisplayComponent,
    CountriesComponent,
    CountryComponent,
    AdminCountriesComponent,
    AdminCitiesComponent,
    CitiesComponent,
    AutoGrowDirective,
    AboutUsComponent,
    ContactUsComponent,
    TermsOfServiceComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    JsonpModule,
    routing,
    Daterangepicker,
    Ng2DeviceDetectorModule.forRoot()
  ],
  providers: [ Title, AdminService, LoadingService, AuthService, UserService, PostService, ItineraryService, ItineraryEventService, ResourceService, FlashMessageService, RelationshipService, NotificationService, FileuploadService, CommentService, ErrorMessageService, FavouriteService, RecommendationService, PlaceService, CountryService, CityService, AuthGuard, AdminGuard, { provide: ErrorHandler, useClass: RavenErrorHandler }],
  bootstrap: [AppComponent]
})
export class AppModule { }
