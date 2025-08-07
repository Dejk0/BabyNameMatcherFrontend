import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiClient, HunNames } from '../ApiClient';
import { take } from 'rxjs';
import { NameCardComponent } from '../name-card/name-card.component';
import { NamebuttonsComponent } from '../namebuttons/namebuttons.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalizationService } from '../services/localization.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-names-list',
  imports: [CommonModule, ReactiveFormsModule, NamebuttonsComponent],
  templateUrl: './names-list.component.html',
  styleUrl: './names-list.component.css',
})
export class NamesListComponent implements OnInit {
  names: HunNames[] = [];
  isThrowedNames? = false;

  constructor(
    private readonly client: ApiClient,
    public loc: LocalizationService,
    private readonly activeModal: NgbActiveModal,
    private readonly modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    if (this.isThrowedNames) {
      this.client
        .getThrowedNames()
        .pipe(take(1))
        .subscribe((x) => {
          if (x) {
            x.map((y) => this.names.push(y));
          }
        });
    } else {
      this.client
        .getSelectedNames()
        .pipe(take(1))
        .subscribe((x) => {
          if (x) {
            x.map((y) => this.names.push(y));
          }
        });
    }
  }

  onClick(item: HunNames) {
    this.confirmAndThrow(item.id);
  }

  close() {
    this.activeModal.dismiss();
  }

  async confirmAndThrow(id?: number) {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      centered: true,
    });

    modalRef.componentInstance.title = this.isThrowedNames
      ? this.loc.get(41, 'To select a throwed name.')
      : this.loc.get(39, 'Throw selected name.');
    modalRef.componentInstance.message = this.loc.get(40, 'Are you sure?');
    modalRef.result.then((x) => {
      if (x) {
        // ✅ Felhasználó megerősítette
        this.client
          .changeSelectedName(id)
          .pipe(take(1))
          .subscribe((x) => {
            if (x) {
              this.names = [];
              this.load();
            }
          });
      }
    });
  }
}
