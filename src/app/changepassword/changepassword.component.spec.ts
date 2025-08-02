import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangepasswordComponent } from './changepassword.component';
import {
  ApiClient,
  BaseValidResponse,
  ChangePasswordParamsDto,
} from '../ApiClient';
import { LocalizationService } from '../services/localization.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('ChangepasswordComponent', () => {
  let component: ChangepasswordComponent;
  let fixture: ComponentFixture<ChangepasswordComponent>;
  let apiClientSpy: jasmine.SpyObj<ApiClient>;
  let modalSpy: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    apiClientSpy = jasmine.createSpyObj('ApiClient', ['changePassword']);
    modalSpy = jasmine.createSpyObj('NgbActiveModal', ['close']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ChangepasswordComponent],
      providers: [
        { provide: ApiClient, useValue: apiClientSpy },
        { provide: LocalizationService, useValue: { get: () => '' } },
        { provide: NgbActiveModal, useValue: modalSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangepasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should invalidate the form when fields are empty', () => {
    component.changepwform.setValue({
      currentPassword: '',
      password: '',
      confirmPassword: '',
    });
    expect(component.changepwform.valid).toBeFalse();
  });

  it('should invalidate when password and confirmPassword do not match', () => {
    component.changepwform.setValue({
      currentPassword: 'Test1234',
      password: 'Test1234',
      confirmPassword: 'Different1234',
    });
    expect(component.changepwform.errors).toEqual({ passwordMismatch: true });
  });

  it('should call API and close modal on valid submission', () => {
    component.changepwform.setValue({
      currentPassword: 'Test1234',
      password: 'Test1234',
      confirmPassword: 'Test1234',
    });

    apiClientSpy.changePassword.and.returnValue(
      of({ isValid: true } as BaseValidResponse)
    );

    component.onPwChange();

    expect(apiClientSpy.changePassword).toHaveBeenCalledWith({
      currentPassword: 'Test1234',
      newPassword: 'Test1234',
    } as ChangePasswordParamsDto);
    expect(modalSpy.close).toHaveBeenCalled();
  });

  it('should NOT close modal if API response is invalid', () => {
    component.changepwform.setValue({
      currentPassword: 'Test1234',
      password: 'Test1234',
      confirmPassword: 'Test1234',
    });

    apiClientSpy.changePassword.and.returnValue(
      of({ isValid: false } as BaseValidResponse)
    );

    component.onPwChange();

    expect(modalSpy.close).not.toHaveBeenCalled();
  });
});
