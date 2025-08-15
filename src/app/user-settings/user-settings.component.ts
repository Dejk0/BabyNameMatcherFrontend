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
import { NamesListComponent } from '../names-list/names-list.component';
import { SetUserPartnerComponent } from '../set-user-partner/set-user-partner.component';
import { loadTranslations } from '@angular/localize';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class UserSettingsComponent implements OnInit {
  public nameController = new FormControl('', [Validators.required]);
  public familyNameController = new FormControl('', [Validators.required]);
  familyName = '';
  settingsForm = new FormGroup({
    name: this.nameController,
    familyName: this.familyNameController,
  });

  partnerName = '';
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
      .getUserPartnerName()
      .pipe(take(1))
      .subscribe((x) => {
        if (x.isValid) {
          if (x.partnerUserName) {
            this.partnerName = x.partnerUserName;
          }
        } else {
        }
      });

    this.familyNameController.setValue(
      this.auth.getUserSelectedFamilyname$().value
    );
  }

  save() {
    const familyName = this.familyNameController.value;
    const name = this.nameController.value;
    if (this.settingsForm.valid && familyName && name) {
      const settings = this.settingsForm.value;

      if (familyName !== this.familyName) {
        this.loadPartnerName();
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
      centered: true,
    });
  }

  openSelectedNamesModal() {
    this.modalService.open(NamesListComponent, {
      size: 'md',
      backdrop: 'static',
      centered: true,
    });
  }

  openThrowedNamesModal() {
    const ref = this.modalService.open(NamesListComponent, {
      size: 'md',
      backdrop: 'static',
      centered: true,
    });
    ref.componentInstance.isThrowedNames = true;
  }

  openMatchedNamesModal() {
    const ref = this.modalService.open(NamesListComponent, {
      size: 'md',
      backdrop: 'static',
      centered: true,
    });
    ref.componentInstance.isMatchedNames = true;
    ref.componentInstance.hasPair = false;
  }

  openUserPartnerModal() {
    const ref = this.modalService.open(SetUserPartnerComponent, {
      size: 'md',
      backdrop: 'static',
      centered: true,
    });

    ref.result.then((x) => {
      this.loadPartnerName();
    });
  }

  loadPartnerName() {
    this.client
      .getUserPartnerName()
      .pipe(take(1))
      .subscribe((x) => {
        if (x.isValid) {
          if (x.partnerUserName) {
            this.partnerName = x.partnerUserName;
          }
        } else {
          this.partnerName = '';
        }
      });
  }

  close() {
    this.activeModal.dismiss();
  }
}
