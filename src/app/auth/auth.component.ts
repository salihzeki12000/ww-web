import { Component, OnInit, Input, NgZone, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
// declare const FB: any;
declare const gapi: any;

import { AuthService }       from './auth.service';
import { UserService }       from '../user';
import { LoadingService }    from '../loading';
import { ItineraryService }  from '../itinerary';

@Component({
  selector: 'ww-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, AfterViewInit {
  @Input() reroute;
  @Input() reload;
  @Input() itinerary;

  public auth2: any;
  loading = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private itineraryService: ItineraryService,
    private loadingService: LoadingService,
    private _zone: NgZone,
    private router: Router)  {
      // FB.init({
      //       appId      : '1751057965157438', //1751057965157438 - 1751163758480192
      //       cookie     : false,  // enable cookies to allow the server to access the session
      //       xfbml      : true,  // parse social plugins on this page
      //       version    : 'v2.5' // use graph api version 2.5
      //   });
    }

  ngOnInit()  {
    this.loadingService.setLoader(false, "");
    // FB.getLoginStatus(response => {
    //   this.statusChangeCallback(response);
    // });

    if(this.reroute === undefined)  {
      this.reroute = '/me'
    }
  }

  // https://developers.google.com/identity/sign-in/web/sign-in
  ngAfterViewInit() {
    setTimeout(() =>  {
      this.initGoogle();
    }, 500)
  }

  //https://stackoverflow.com/questions/38846232/how-to-implement-signin-with-google-in-angular-2-using-typescript
  initGoogle()  {
    let that = this;

    gapi.load('auth2', () =>  {
      that.auth2 = gapi.auth2.init({
        client_id: '93839965709-mmulmhsh4vlqdhqdi9e41ve51julgak1.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        scope: 'profile email'
      })

      that.signinGoogle(document.getElementById('google-login'))
    })
  }

  signinGoogle(element)  {
    let that = this;
    this.auth2.attachClickHandler(element, {},
      (user) => {
        this.loginGoogle(user);
      }, (error) => {
        console.log(error)
      });
  }

  // http://stackoverflow.com/questions/35530483/google-sign-in-for-websites-and-angular-2-using-typescript
  loginGoogle(user) {
    this.loading = true;
    let profile = user.getBasicProfile();

    let newUser = {
      username: profile.getName(),
      email: profile.getEmail(),
      display_picture: {
        url: profile.getImageUrl()
      }
    }

    this.authService.loginGoogle(newUser).subscribe(
      data => {
        this.loadingService.setLoader(true, "get ready to wonder wander");

        let savedUser = {_id: data.userId};
        this.rerouting(savedUser);
      });
  }

  rerouting(user) {
    // this.userService.getCurrentUser().subscribe(
    //   data => {
        if(this.itinerary)  {
          this.addToItin(user);
        } else if(this.reload)  {
          window.location.reload();
        } else  {
          setTimeout(() =>  {
            this.router.navigateByUrl(this.reroute);
            window.location.reload();
          }, 500)
        }
      // });
  }

  addToItin(user) {
    for (let i = 0; i < this.itinerary['members'].length; i++) {
      if(this.itinerary['members'][i]['_id'] === user)  {
        this.router.navigateByUrl(this.reroute);
        window.location.reload();
        break;
      }
    }

    this.itinerary['members'].push(user);

    this.itineraryService.updateItinUser(this.itinerary).subscribe(
      data => {
        setTimeout(() =>  {
          this.router.navigateByUrl(this.reroute);
          window.location.reload();
        }, 1000)
      })

  }
}

// statusChangeCallback(res) {
//   // https://developers.facebook.com/docs/facebook-login/web
//   if (res.status === 'connected') {
//     this.getDetails()
//   }
// };

// loginFacebook() {
//   FB.login((response) =>  {
//     this.loadingService.setLoader(true, "get ready to wonder wander");
//
//     this.getDetails();
//   }, {scope: 'email' });
// }
//
// getDetails() {
//   FB.api('/me?fields=id,name,gender,picture.width(150).height(150),email',
//     (result) => {
//       if (result && !result.error) {
//         // if no email, to open up a modal notice and to sign up or sign in
//         result['username'] = result['name'];
//         result['display_picture'] = {
//           url: result['picture']['data']['url'],
//         }
//
//         this.authService.loginFacebook(result)
//             .subscribe(
//               data => {
//                 this.loadingService.setLoader(true, "We are redirecting you");
//
//                 this.userService.getCurrentUser()
//                     .subscribe(data => {});
//
//                 this.rerouting({_id: data.userId});
//               }
//             )
//       } else {
//         console.log(result.error);
//       }
//     });
// }
