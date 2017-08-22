import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUnverifiedComponent } from './user-unverified.component';

describe('UserUnverifiedComponent', () => {
  let component: UserUnverifiedComponent;
  let fixture: ComponentFixture<UserUnverifiedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserUnverifiedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserUnverifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
