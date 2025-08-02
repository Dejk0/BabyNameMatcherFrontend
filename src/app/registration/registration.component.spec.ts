import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrationComponent } from './registration.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../auth/auth.module';
import { LocalizationService } from '../services/localization.service';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegistrationComponent, // Standalone component
        HttpClientTestingModule,
        ReactiveFormsModule,
      ],
      providers: [NgbActiveModal, AuthService, LocalizationService],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid initially', () => {
    expect(component.registrationForm.valid).toBeFalse();
  });

  it('form should be valid when all fields are correctly filled', () => {
    component.emailController.setValue('test@example.com');
    component.userNameController.setValue('testuser');
    component.familyNameController.setValue('TestFamily');
    component.passwordController.setValue('secret123');
    component.confirmPasswordController.setValue('secret123');

    expect(component.registrationForm.valid).toBeTrue();
  });

  it('should set password mismatch error when passwords differ', () => {
    component.passwordController.setValue('secret123');
    component.confirmPasswordController.setValue('other123');

    component.registrationForm.updateValueAndValidity();
    expect(component.registrationForm.errors?.['passwordMismatch']).toBeTrue();
  });

  it('should not call register if the form is invalid', () => {
    const spy = spyOn(component['client'], 'register').and.callThrough();
    component.OnRegist();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should call register if form is valid', () => {
    const registerSpy = spyOn(component['client'], 'register').and.returnValue({
      pipe: () => ({
        subscribe: () => {},
      }),
    } as any);

    component.isPairRegistration = false;

    component.emailController.setValue('test@example.com');
    component.userNameController.setValue('testuser');
    component.familyNameController.setValue('TestFamily');
    component.passwordController.setValue('secret123');
    component.confirmPasswordController.setValue('secret123');
    component.pairEmailController.setValue('dummy@example.com');
    component.pairNameController.setValue('PairName');

    component.registrationForm.updateValueAndValidity();
    component.OnRegist();

    expect(registerSpy).toHaveBeenCalled();
  });

  it('should set form error if register response contains error', () => {
    spyOn(component['client'], 'register').and.returnValue({
      pipe: () => ({
        subscribe: (cb: (res: any) => void) =>
          cb({ error: 'Username is invalid' }),
      }),
    } as any);

    component.isPairRegistration = false;

    component.emailController.setValue('test@example.com');
    component.userNameController.setValue('testuser');
    component.familyNameController.setValue('TestFamily');
    component.passwordController.setValue('secret123');
    component.confirmPasswordController.setValue('secret123');
    component.pairEmailController.setValue('dummy@example.com');
    component.pairNameController.setValue('dummy');

    component.OnRegist();

    expect(component.registrationForm.errors?.['serverError']).toBe(
      'Username is invalid'
    );
  });

  it('should close modal on successful registration', () => {
    const modal = TestBed.inject(NgbActiveModal);
    const modalSpy = spyOn(modal, 'close');

    spyOn(component['client'], 'register').and.returnValue({
      pipe: () => ({
        subscribe: (cb: (res: any) => void) => cb({ error: null }),
      }),
    } as any);

    component.isPairRegistration = false;

    component.emailController.setValue('test@example.com');
    component.userNameController.setValue('testuser');
    component.familyNameController.setValue('TestFamily');
    component.passwordController.setValue('secret123');
    component.confirmPasswordController.setValue('secret123');
    component.pairEmailController.setValue('dummy@example.com');
    component.pairNameController.setValue('dummy');

    component.OnRegist();

    expect(modalSpy).toHaveBeenCalled();
  });

  describe('Pair registration mode', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(RegistrationComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show pair fields when isPairRegistration is true', () => {
      component.isPairRegistration = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[data-testid="pairEmail"]')).toBeTruthy();
      expect(compiled.querySelector('[data-testid="pairName"]')).toBeTruthy();
    });

    it('should hide pair fields when isPairRegistration is false', () => {
      component.isPairRegistration = false;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('[data-testid="pairEmail"]')).toBeFalsy();
      expect(compiled.querySelector('[data-testid="pairName"]')).toBeFalsy();
    });

    it('should call registerWithPair when isPairRegistration is true and form is valid', () => {
      component.isPairRegistration = true;

      spyOn(component['client'], 'registerWithPair').and.returnValue({
        pipe: () => ({
          subscribe: () => {},
        }),
      } as any);

      component.emailController.setValue('test@example.com');
      component.userNameController.setValue('testuser');
      component.familyNameController.setValue('TestFamily');
      component.passwordController.setValue('secret123');
      component.confirmPasswordController.setValue('secret123');
      component.pairEmailController.setValue('pair@example.com');
      component.pairNameController.setValue('PairName');

      component.OnRegist();

      expect(component['client'].registerWithPair).toHaveBeenCalled();
    });

    it('should not call registerWithPair when isPairRegistration is true but pair fields are empty', () => {
      component.isPairRegistration = true;

      const spy = spyOn(
        component['client'],
        'registerWithPair'
      ).and.returnValue({
        pipe: () => ({
          subscribe: () => {},
        }),
      } as any);

      component.emailController.setValue('test@example.com');
      component.userNameController.setValue('testuser');
      component.familyNameController.setValue('TestFamily');
      component.passwordController.setValue('secret123');
      component.confirmPasswordController.setValue('secret123');
      component.pairEmailController.setValue('');
      component.pairNameController.setValue('');

      component.OnRegist();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should require pairEmail only when isPairRegistration is true', () => {
      component.isPairRegistration = false;
      component.pairEmailController.setValue('');
      component.pairEmailController.updateValueAndValidity();
      expect(component.pairEmailController.valid).toBeTrue();

      component.isPairRegistration = true;
      component.pairEmailController.setValue('');
      component.pairEmailController.updateValueAndValidity();
      expect(component.pairEmailController.valid).toBeFalse();

      component.pairEmailController.setValue('pair@example.com');
      component.pairEmailController.updateValueAndValidity();
      expect(component.pairEmailController.valid).toBeTrue();
    });
  });
});
