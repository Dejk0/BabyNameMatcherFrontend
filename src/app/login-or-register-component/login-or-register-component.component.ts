import { Component } from '@angular/core';
import { RegistrationComponent } from '../registration/registration.component';
import { LoginComponent } from '../login/login.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { LocalizationService } from '../services/localization.service';

@Component({
  selector: 'app-login-or-register-component',
  imports: [RegistrationComponent, LoginComponent, NgbNavModule],
  templateUrl: './login-or-register-component.component.html',
  styleUrl: './login-or-register-component.component.css',
})
export class LoginOrRegisterComponentComponent {
  /**
   *
   */
  constructor(public loc: LocalizationService) {}

  active = 1;
}
