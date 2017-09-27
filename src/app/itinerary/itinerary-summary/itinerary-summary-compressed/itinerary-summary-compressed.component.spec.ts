/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ItinerarySummaryCompressedComponent } from './itinerary-summary-compressed.component';

describe('ItinerarySummaryCompressedComponent', () => {
  let component: ItinerarySummaryCompressedComponent;
  let fixture: ComponentFixture<ItinerarySummaryCompressedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItinerarySummaryCompressedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItinerarySummaryCompressedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
