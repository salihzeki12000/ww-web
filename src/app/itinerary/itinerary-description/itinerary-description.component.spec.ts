import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryDescriptionComponent } from './itinerary-description.component';

describe('ItineraryDescriptionComponent', () => {
  let component: ItineraryDescriptionComponent;
  let fixture: ComponentFixture<ItineraryDescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItineraryDescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
