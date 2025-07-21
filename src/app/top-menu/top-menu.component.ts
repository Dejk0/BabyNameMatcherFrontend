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
    private dialog: NgbModal,
    public auth: AuthService,
    private modalService: NgbModal
  ) {}

  openLoginModal() {
    this.modalService.open(LoginComponent, {
      size: 'md',
      backdrop: 'static',
    });
  }

  onLogout() {
    this.auth.logout();
  }
}
