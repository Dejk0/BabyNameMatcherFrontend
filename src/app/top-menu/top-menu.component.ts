import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../auth/auth.module';
import {
  NgbDropdownModule,
  NgbModal,
  NgbScrollSpyModule,
} from '@ng-bootstrap/ng-bootstrap';
import { UserSettingsComponent } from '../user-settings/user-settings.component';
import { LocPipe } from '../pipes/loc.pipe';
import { LocalizationService } from '../services/localization.service';
import { RegistrationComponent } from '../registration/registration.component';
import { LoginOrRegisterComponentComponent } from '../login-or-register-component/login-or-register-component.component';

@Component({
  selector: 'app-top-menu',
  imports: [CommonModule, NgbScrollSpyModule, NgbDropdownModule],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.css',
})
export class TopMenuComponent {
  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  constructor(
    public auth: AuthService,
    private modalService: NgbModal,
    public loc: LocalizationService
  ) {}

  openLoginModal() {
    this.modalService.open(LoginOrRegisterComponentComponent, {
      size: 'md',
      backdrop: 'static',
    });
  }

  openUserSettingsModal() {
    this.modalService.open(UserSettingsComponent, {
      size: 'md',
      backdrop: 'static',
    });
  }

  onLogout() {
    this.auth.logout();
  }
}
