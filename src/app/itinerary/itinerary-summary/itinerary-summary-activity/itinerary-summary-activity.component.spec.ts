import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItinerarySummaryEventComponent } from './itinerary-summary-event.component';

describe('ItinerarySummaryEventComponent', () => {
  let component: ItinerarySummaryEventComponent;
  let fixture: ComponentFixture<ItinerarySummaryEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItinerarySummaryEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItinerarySummaryEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
