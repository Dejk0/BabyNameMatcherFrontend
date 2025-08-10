import { Component, OnInit } from '@angular/core';
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
export class TopMenuComponent implements OnInit {
  isOpen = false;

  selectedLang = 'en'; // vagy olvasd ki a LocalizationService-ből

  changeLang(lang: 'hu' | 'en') {
    this.selectedLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
    this.loc.loadLocalizations(lang); // vagy hasonló metódus
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  constructor(
    public auth: AuthService,
    private modalService: NgbModal,
    public loc: LocalizationService
  ) {}
  ngOnInit(): void {
    const lang = localStorage.getItem('lang');
    if (lang) {
      this.loc.loadLocalizations(lang);
      this.selectedLang = lang;
    } else {
      this.loc.loadLocalizations('en');
    }
  }

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
      centered: true,
    });
  }

  onLogout() {
    this.auth.logout();
  }
}
