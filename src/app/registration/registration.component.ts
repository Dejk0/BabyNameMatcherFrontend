import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  ValidationErrors,
  AbstractControl,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { expand, Subject, takeUntil, throwError } from 'rxjs';
import {
  ApiClient,
  RegisterResultDto,
  RegistrParamsDto,
  RegistrWithPairParamsDto,
} from '../ApiClient';
import { LocalizationService } from '../services/localization.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  public emailController = new FormControl('', [Validators.required]);
  public passwordController = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  public confirmPasswordController = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  public userNameController = new FormControl('', [Validators.required]);
  public familyNameController = new FormControl('', [Validators.required]);
  public pairEmailController = new FormControl('');
  public pairNameController = new FormControl('');

  registrationForm = new FormGroup(
    {
      email: this.emailController,
      password: this.passwordController,
      username: this.userNameController,
      familyname: this.familyNameController,
      confirmPassword: this.confirmPasswordController,
      pairEmail: this.pairEmailController,
      pairName: this.pairNameController,
    },
    { validators: passwordMatchValidator() }
  );

  private _isPairRegistration = false;

  private destroy$ = new Subject<void>();

  constructor(
    private modal: NgbActiveModal,
    private client: ApiClient,
    public loc: LocalizationService
  ) {}

  close() {
    this.modal.close();
  }

  dismiss() {
    this.modal.dismiss();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  OnRegist() {
    this.registrationForm.markAllAsTouched();
    if (!this.registrationForm.valid) {
      return;
    }

    const email = this.emailController.value;
    const password = this.passwordController.value;
    const username = this.userNameController.value;
    const familyname = this.familyNameController.value;
    const confirmPassword = this.confirmPasswordController.value;
    const pairEmail = this.pairEmailController.value;
    const pairName = this.pairNameController.value;

    if (
      !email ||
      !password ||
      !username ||
      !familyname ||
      !confirmPassword ||
      !pairEmail ||
      !pairName
    ) {
      return;
    }

    if (this.isPairRegistration) {
      if (!this.pairEmailController.valid || !this.pairNameController.valid) {
        return; // pármezők érvénytelenek
      }

      this.client
        .registerWithPair({
          email: this.emailController.value!,
          userName: this.userNameController.value!,
          familyName: this.familyNameController.value!,
          password: this.passwordController.value!,
          confirmPassword: this.confirmPasswordController.value!,
          pairEmail: this.pairEmailController.value!,
          pairName: this.pairNameController.value!,
        } as RegistrWithPairParamsDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res?.error) {
            this.registrationForm.setErrors({ serverError: res.error });
            return;
          }
          console.log(res);
          this.modal.close();
        });
    } else {
      this.client
        .register({
          email: this.emailController.value!,
          userName: this.userNameController.value!,
          familyName: this.familyNameController.value!,
          password: this.passwordController.value!,
          confirmPassword: this.confirmPasswordController.value!,
        } as RegistrParamsDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res?.error) {
            this.registrationForm.setErrors({ serverError: res.error });
            return;
          }
          console.log(res);
          this.modal.close();
        });
    }
  }

  get isPairRegistration(): boolean {
    return this._isPairRegistration;
  }

  set isPairRegistration(value: boolean) {
    this._isPairRegistration = value;

    if (value) {
      this.pairEmailController.setValidators([
        Validators.required,
        Validators.email,
      ]);
      this.pairNameController.setValidators([Validators.required]);
    } else {
      this.pairEmailController.clearValidators();
      this.pairNameController.clearValidators();
    }

    this.pairEmailController.updateValueAndValidity();
    this.pairNameController.updateValueAndValidity();
  }

  onPairToggleChanged(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isPairRegistration = checkbox.checked;
  }
}

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      return null; // csak FormGroup-on működjön
    }

    const password = control.get('password')?.value ?? '';
    const confirmPassword = control.get('confirmPassword')?.value ?? '';

    if (!password || !confirmPassword) {
      return null; // ne validáljon, ha még nincs beírva mindkettő
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
