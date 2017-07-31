import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationPinComponent } from './location-pin.component';

describe('LocationPinComponent', () => {
  let component: LocationPinComponent;
  let fixture: ComponentFixture<LocationPinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationPinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationPinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
