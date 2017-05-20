import { Component, OnInit, NgZone, Renderer, ElementRef, ViewChild } from '@angular/core';
import {
    Router,
    Event as RouterEvent,
    NavigationStart,
    NavigationEnd,
    NavigationCancel,
    NavigationError
} from '@angular/router';

@Component({
  selector: 'ww-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  loading: boolean = true;
  @ViewChild('spinnerElement') spinnerElement: ElementRef;

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private renderer: Renderer) {
      router.events.subscribe((event: RouterEvent) => {
        this.navigationInterceptor(event);
      });
    }

  // http://stackoverflow.com/questions/37069609/show-loading-screen-when-navigating-between-routes-in-angular-2
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true;
    }
    if (event instanceof NavigationEnd) {
      setTimeout(() => this.loading = false, 1500);
      // this.loading = false;
      // console.log(this.loading);
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      this.loading = false;
    }
    if (event instanceof NavigationError) {
      this.loading = false;
    }
  }

  ngOnInit()  {
  }
}



// // Shows and hides the loading spinner during RouterEvent changes
//   private navigationInterceptor(event: RouterEvent): void {
//
//       if (event instanceof NavigationStart) {
//
//           // We wanna run this function outside of Angular's zone to
//           // bypass change detection
//           this.ngZone.runOutsideAngular(() => {
//
//               // For simplicity we are going to turn opacity on / off
//               // you could add/remove a class for more advanced styling
//               // and enter/leave animation of the spinner
//               this.renderer.setElementStyle(
//                   this.spinnerElement.nativeElement,
//                   'opacity',
//                   '1'
//               );
//           });
//       }
//       if (event instanceof NavigationEnd) {
//           this._hideSpinner();
//       }
//
//       // Set loading state to false in both of the below events to
//       // hide the spinner in case a request fails
//       if (event instanceof NavigationCancel) {
//           this._hideSpinner
//       }
//       if (event instanceof NavigationError) {
//           this._hideSpinner();
//       }
//   }
//
//
//   private _hideSpinner(): void {
//
//       // We wanna run this function outside of Angular's zone to
//       // bypass change detection,
//       this.ngZone.runOutsideAngular(() => {
//
//           // For simplicity we are going to turn opacity on / off
//           // you could add/remove a class for more advanced styling
//           // and enter/leave animation of the spinner
//           this.renderer.setElementStyle(
//               this.spinnerElement.nativeElement,
//               'opacity',
//               '0'
//           );
//       });
//   }
