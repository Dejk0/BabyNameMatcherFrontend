import { CommonModule } from '@angular/common';
import { Component, Input, input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiClient, NameSelectrionResultDto } from '../ApiClient';
import { catchError, of, take } from 'rxjs';
import { NameCardComponent } from '../name-card/name-card.component';
import { NamebuttonsComponent } from '../namebuttons/namebuttons.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalizationService } from '../services/localization.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AuthService } from '../auth/auth.module';

@Component({
  selector: 'app-names-list',
  imports: [CommonModule, ReactiveFormsModule, NamebuttonsComponent],
  templateUrl: './names-list.component.html',
  styleUrl: './names-list.component.css',
})
export class NamesListComponent implements OnInit {
  @Input() hasPair: boolean = false;

  names: NameSelectrionResultDto[] = [];
  isThrowedNames? = false;
  isMatchedNames? = false;
  placeholder = '';
  searchCtrl = new FormControl<string>('', { nonNullable: true });

  isVisible(item: NameSelectrionResultDto): boolean {
    const q = this.searchCtrl.value.trim().toLowerCase();
    if (!q) return true;
    return (item.name ?? '').toLowerCase().includes(q);
  }

  constructor(
    private readonly client: ApiClient,
    public loc: LocalizationService,
    private readonly activeModal: NgbActiveModal,
    private readonly modalService: NgbModal,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
    this.placeholder = this.loc.get(42, 'Search by name…');
  }

  load() {
    if (this.isMatchedNames) {
      this.client
        .getMatchedNames()
        .pipe(take(1))
        .subscribe((x) => {
          if (x) {
            x.map((y) => this.names.push(y));
          }
        });
      return;
    }

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

  onClick(item: NameSelectrionResultDto) {
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
          .pipe(
            take(1),
            catchError((error) => {
              return of(null);
            })
          )
          .subscribe((x) => {
            if (x) {
              this.names = [];
              this.load();
            }
          });
      }
    });
  }

  get filteredNames(): NameSelectrionResultDto[] {
    const q = this.searchCtrl.value.trim().toLowerCase();
    if (!q) return this.names;
    return this.names.filter((n) => (n.name ?? '').toLowerCase().includes(q));
  }
}
