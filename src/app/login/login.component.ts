import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ApiClient, LoginDto } from '../ApiClient';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  public userNameController = new FormControl('', [Validators.required]);
  public passwordController = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
  ]);
  loginForm = new FormGroup({
    username: this.userNameController,
    password: this.passwordController,
  });

  /**
   *
  //  */
  // constructor(private client: ApiClient) {}

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Belépési adatok:', this.loginForm.value);
      // this.client.login({
      //   email: this.userNameController?.value,
      //   password: this.passwordController?.value,
      // } as LoginDto);
      // Itt hívd a backend szolgáltatást vagy más logikát
    } else {
      this.loginForm.markAllAsTouched(); // jelzi a hibákat, ha submitnál érvénytelen
    }
  }
}
