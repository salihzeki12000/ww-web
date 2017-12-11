import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItinerarySummaryTransportComponent } from './itinerary-summary-transport.component';

describe('ItinerarySummaryTransportComponent', () => {
  let component: ItinerarySummaryTransportComponent;
  let fixture: ComponentFixture<ItinerarySummaryTransportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItinerarySummaryTransportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItinerarySummaryTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
