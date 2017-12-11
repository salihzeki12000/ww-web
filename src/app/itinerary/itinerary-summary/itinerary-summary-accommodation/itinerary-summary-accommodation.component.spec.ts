import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItinerarySummaryAccommodationComponent } from './itinerary-summary-accommodation.component';

describe('ItinerarySummaryAccommodationComponent', () => {
  let component: ItinerarySummaryAccommodationComponent;
  let fixture: ComponentFixture<ItinerarySummaryAccommodationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItinerarySummaryAccommodationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItinerarySummaryAccommodationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
