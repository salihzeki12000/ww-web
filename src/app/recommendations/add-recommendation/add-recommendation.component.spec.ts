import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRecommendationComponent } from './add-recommendation.component';

describe('AddRecommendationComponent', () => {
  let component: AddRecommendationComponent;
  let fixture: ComponentFixture<AddRecommendationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRecommendationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
