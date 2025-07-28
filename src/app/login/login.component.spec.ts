import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth/auth.module';
import { of, Subject, throwError } from 'rxjs';
import { TokenResponse } from '../ApiClient';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginSpy: jasmine.Spy;

  beforeEach(async () => {
    loginSpy = jasmine.createSpy().and.returnValue({ subscribe: () => {} });

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: loginSpy,
          },
        },
        NgbActiveModal,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid initially', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('form should be valid with correct values', () => {
    component.emailController.setValue('user@example.com');
    component.passwordController.setValue('password123');

    expect(component.loginForm.valid).toBeTrue();
  });

  it('should not call auth.login if email or password is missing', () => {
    component.emailController.setValue('');
    component.passwordController.setValue('');
    component.onLogin();

    expect(loginSpy).not.toHaveBeenCalled(); // ← ezt használd
  });

  it('should close modal on successful login', () => {
    const modalSpy = spyOn(component['modal'], 'close');
    loginSpy.and.returnValue(of({} as TokenResponse)); // <-- NE újra spyOn!

    component.emailController.setValue('user@example.com');
    component.passwordController.setValue('password123');
    component.onLogin();

    expect(loginSpy).toHaveBeenCalled();
    expect(modalSpy).toHaveBeenCalled();
  });

  it('should show alert on login error', () => {
    spyOn(window, 'alert');
    loginSpy.and.returnValue(throwError(() => 'Invalid login')); // <-- csak .and.returnValue, NEM spyOn!

    component.emailController.setValue('user@example.com');
    component.passwordController.setValue('wrongpass');
    component.onLogin();

    expect(window.alert).toHaveBeenCalledWith('Hibás email vagy jelszó!');
  });

  it('should complete destroy$ on destroy', () => {
    const destroy$ = component['destroy$'] as Subject<void>;
    const completeSpy = spyOn(destroy$, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(completeSpy).toHaveBeenCalled();
  });
});
