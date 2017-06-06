/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UserItinerariesComponent } from './user-itineraries.component';

describe('UserItinerariesComponent', () => {
  let component: UserItinerariesComponent;
  let fixture: ComponentFixture<UserItinerariesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserItinerariesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserItinerariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
