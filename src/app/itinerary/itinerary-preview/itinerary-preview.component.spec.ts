import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItineraryPreviewComponent } from './itinerary-preview.component';

describe('ItineraryPreviewComponent', () => {
  let component: ItineraryPreviewComponent;
  let fixture: ComponentFixture<ItineraryPreviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItineraryPreviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItineraryPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
