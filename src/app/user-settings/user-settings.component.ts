import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { ApiClient, ChangeNameParams, GetFamilyNameResult } from '../ApiClient';
import { map, Observable, of, Subject, take, takeUntil, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class UserSettingsComponent implements OnInit {
  private destroy$ = new Subject<void>();
  public nameController = new FormControl('', [Validators.required]);
  public familyNameController = new FormControl('', [Validators.required]);
  familyName = '';
  settingsForm = new FormGroup({
    name: this.nameController,
    familyName: this.familyNameController,
  });
  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public loc: LocalizationService,
    private auth: AuthService,
    private client: ApiClient
  ) {}

  ngOnInit(): void {
    this.nameController.setValue(
      this.auth?.username?.value ? this.auth?.username?.value : ''
    );
    this.client
      .getFamilyname()
      .pipe(take(1))
      .subscribe((x: GetFamilyNameResult) => {
        if (!x) {
          return;
        }
        if (!x.isValid && x.message) {
          window.alert(x?.message.join('\n'));
        }
        const familyName = x?.familyName ? x?.familyName : '';
        this.familyName = familyName;
        this.familyNameController.setValue(familyName);
      });
  }

  save() {
    const familyName = this.familyNameController.value;
    const name = this.nameController.value;
    if (this.settingsForm.valid && familyName && name) {
      const settings = this.settingsForm.value;

      if (familyName !== this.familyName) {
        this.client
          .changeFamilyname({
            newName: familyName,
          } as ChangeNameParams)
          .pipe(take(1))
          .subscribe((x) => {
            if (!x.isValid && x.message) {
              window.alert(x?.message.join('\n'));
            }
          });
      }

      if (name !== this.auth.username?.value) {
        this.client
          .changeUsername({ newName: name } as ChangeNameParams)
          .pipe(take(1))
          .subscribe((x) => {
            if (!x.isValid && x.message) {
              window.alert(x?.message.join('\n'));
            }
            this.client
              .sendingNewToken()
              .pipe(take(1))
              .subscribe((x) => {
                if (x.token) {
                  localStorage.setItem(this.auth.TOKEN_KEY, x.token);
                }
              });
          });
      }

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
