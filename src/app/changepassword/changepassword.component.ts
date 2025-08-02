import { Component } from '@angular/core';
import { LocalizationService } from '../services/localization.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ApiClient,
  BaseValidResponse,
  ChangePasswordParamsDto,
} from '../ApiClient';
import { takeUntil } from 'rxjs';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-changepassword',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css',
})
export class ChangepasswordComponent {
  constructor(
    public loc: LocalizationService,
    private client: ApiClient,
    public activeModal: NgbActiveModal
  ) {}

  public passwordController = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  public confirmPasswordController = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  public currentPasswordController = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);

  changepwform = new FormGroup(
    {
      currentPassword: this.currentPasswordController,
      password: this.passwordController,
      confirmPassword: this.confirmPasswordController,
    },
    { validators: passwordMatchValidator() }
  );

  onPwChange() {
    this.changepwform.markAllAsTouched();

    // if (!this.changepwform.valid) {
    //   return;
    // }

    const params = {
      newPassword: this.confirmPasswordController.value,
      currentPassword: this.currentPasswordController.value,
    } as ChangePasswordParamsDto;

    this.client
      .changePassword(params)
      .pipe()
      .subscribe((res: BaseValidResponse) => {
        if (!res.isValid) {
          console.log(res);
          return;
        }

        this.activeModal.close();
      });
  }

  close() {}
}

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!(control instanceof FormGroup)) {
      return null; // csak FormGroup-on működjön
    }

    const password = control.get('password')?.value ?? '';
    const confirmPassword = control.get('confirmPassword')?.value ?? '';

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
