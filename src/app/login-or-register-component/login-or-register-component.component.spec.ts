import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginOrRegisterComponentComponent } from './login-or-register-component.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiClient } from '../ApiClient';
import { LocalizationService } from '../services/localization.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { By } from '@angular/platform-browser';

describe('LoginOrRegisterComponentComponent', () => {
  let component: LoginOrRegisterComponentComponent;
  let fixture: ComponentFixture<LoginOrRegisterComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginOrRegisterComponentComponent, // standalone
        HttpClientTestingModule,
        ReactiveFormsModule,
      ],
      providers: [LocalizationService, ApiClient, NgbActiveModal],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginOrRegisterComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have Login tab active by default', () => {
    expect(component.active).toBe(1);
  });

  it('should render LoginComponent by default', () => {
    const loginElement = fixture.debugElement.query(By.css('app-login'));
    expect(loginElement).toBeTruthy();
  });

  it('should switch to Registration tab and render RegistrationComponent', () => {
    component.active = 2;
    fixture.detectChanges();

    const registrationElement = fixture.debugElement.query(
      By.css('app-registration')
    );
    expect(registrationElement).toBeTruthy();
  });
});
