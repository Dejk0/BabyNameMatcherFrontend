import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { AuthService } from '../auth/auth.module';
import {
  NgbActiveModal,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { finalize, skip, Subject, take } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { LocPipe } from '../pipes/loc.pipe';
import { LocalizationService } from '../services/localization.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  public emailController = new FormControl('', [Validators.required]);
  public passwordController = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  public userNameController = new FormControl('', [Validators.required]);
  loginForm = new FormGroup({
    email: this.emailController,
    password: this.passwordController,
  });
  private destroy$ = new Subject<void>();
  /**
   *
  //  */
  constructor(
    private auth: AuthService,
    private modal: NgbActiveModal,
    public loc: LocalizationService
  ) {}

  close(result: boolean) {
    this.modal.close(result);
  }

  dismiss() {
    this.modal.dismiss();
  }

  onLogin() {
    const email = this.emailController.value;
    const password = this.passwordController.value;

    if (!email || !password) {
      return;
    }
    this.auth.login(email, password).subscribe({
      next: () => {
        // pl. navigáció főoldalra
        this.auth
          .refresFamilyName()
          .pipe(
            skip(1),
            take(1),
            finalize(() => {
              this.modal.close(true);
            })
          )
          .subscribe();
      },
      error: (err) => {
        alert('Hibás email vagy jelszó!');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  OnRegist() {
    this.loginForm.markAllAsTouched();
    if (!this.loginForm.valid) {
      return;
    }

    const email = this.emailController.value;
    const password = this.passwordController.value;

    if (!email || !password) {
      return;
    }
  }
}
