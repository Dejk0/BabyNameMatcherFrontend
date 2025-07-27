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
import { ApiClient, RegisterResultDto, RegistrRequestDto } from '../ApiClient';
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
  registrationForm = new FormGroup(
    {
      email: this.emailController,
      password: this.passwordController,
      username: this.userNameController,
      familyname: this.familyNameController,
      confirmPassword: this.confirmPasswordController,
    },
    { validators: passwordMatchValidator() }
  );

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

    if (!email || !password || !username || !familyname) {
      return;
    }

    this.client
      .register({
        email: email,
        userName: username,
        familyName: familyname,
        password: password,
        confirmPassword: confirmPassword,
      } as RegistrRequestDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: RegisterResultDto) => {
        if (!res) {
          return;
        }
        if (res.error) {
          this.registrationForm.setErrors({ serverError: res.error });
        } else {
          console.log(res);
          this.modal.close();
        }
      });
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
