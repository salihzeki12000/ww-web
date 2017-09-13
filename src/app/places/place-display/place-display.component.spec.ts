import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceDisplayComponent } from './place-display.component';

describe('PlaceDisplayComponent', () => {
  let component: PlaceDisplayComponent;
  let fixture: ComponentFixture<PlaceDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaceDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
