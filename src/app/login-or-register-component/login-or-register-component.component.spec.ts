import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginOrRegisterComponentComponent } from './login-or-register-component.component';

describe('LoginOrRegisterComponentComponent', () => {
  let component: LoginOrRegisterComponentComponent;
  let fixture: ComponentFixture<LoginOrRegisterComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginOrRegisterComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginOrRegisterComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
