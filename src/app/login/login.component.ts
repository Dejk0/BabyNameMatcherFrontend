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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  public emailController = new FormControl('', [Validators.required]);
  public passwordController = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  loginForm = new FormGroup({
    username: this.emailController,
    password: this.passwordController,
  });

  /**
   *
  //  */
  constructor(
    private auth: AuthService,
    public modal: NgbActiveModal // csak ezt használd a modál zárására
  ) {}

  close() {
    this.modal.close();
  }

  dismiss() {
    this.modal.dismiss();
  }

  onSubmit() {
    const email = this.emailController.value;
    const password = this.passwordController.value;

    if (!email || !password) {
      return;
    }
    this.auth.login(email, password).subscribe({
      next: () => {
        // pl. navigáció főoldalra
        this.modal.close();
      },
      error: (err) => {
        alert('Hibás email vagy jelszó!');
      },
    });
  }
}
