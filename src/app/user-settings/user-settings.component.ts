import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocPipe } from '../pipes/loc.pipe';
import { LocalizationService } from '../services/localization.service';
import { ChangepasswordComponent } from '../changepassword/changepassword.component';
import { AuthService } from '../auth/auth.module';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class UserSettingsComponent implements OnInit {
  public nameController = new FormControl('', [Validators.required]);
  public famolyNameController = new FormControl('', [Validators.required]);

  settingsForm = new FormGroup({
    name: this.nameController,
    familyName: this.famolyNameController,
  });

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public loc: LocalizationService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.nameController.setValue(
      this.auth?.username ? this.auth?.username : ''
    );
  }

  save() {
    if (this.settingsForm.valid) {
      const settings = this.settingsForm.value;
      this.activeModal.close(settings);
    }
  }

  openChangePasswordModal() {
    this.modalService.open(ChangepasswordComponent, {
      size: 'md',
      backdrop: 'static',
    });
  }

  close() {
    this.activeModal.dismiss();
  }
}
