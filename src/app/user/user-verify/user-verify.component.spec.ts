import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserVerifyComponent } from './user-verify.component';

describe('UserVerifyComponent', () => {
  let component: UserVerifyComponent;
  let fixture: ComponentFixture<UserVerifyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserVerifyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
