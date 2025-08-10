import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NgbActiveModal,
  NgbAlertModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import {
  ApiClient,
  NameSelectionFilterConditions,
  SelectNameParams,
} from '../ApiClient';
import { LocalizationService } from '../services/localization.service';
import { take } from 'rxjs';
import { SelectNameComponent } from '../select-name/select-name.component';

@Component({
  selector: 'app-mainfilter',
  imports: [CommonModule, ReactiveFormsModule, NgbAlertModule],
  templateUrl: './mainfilter.component.html',
  styleUrl: './mainfilter.component.css',
})
export class MainfilterComponent {
  @Input() initial = null;

  searchNameController = new FormControl('', [Validators.required]);

  alertMessage: string | null = null; // 👈 állapot
  alertType: 'success' | 'warning' | 'danger' | 'info' = 'danger';

  form = new FormGroup({
    gender: new FormControl<'' | 'M' | 'F'>(''),
  });

  constructor(
    public activeModal: NgbActiveModal,
    private readonly modal: NgbModal,
    private readonly client: ApiClient,
    public readonly loc: LocalizationService
  ) {}

  ngOnInit() {
    if (this.initial) this.form.patchValue(this.initial);
  }

  apply() {
    this.activeModal.close(this.form.value);
  }

  clear() {
    this.activeModal.close('clear');
  }

  searchName() {
    this.searchNameController.markAsTouched();
    const name = this.searchNameController.value?.trim();
    if (!name) return;

    this.client
      .getName(new NameSelectionFilterConditions({ name }))
      .pipe(take(1))
      .subscribe((x) => {
        if (!x || !x.isValid) {
          this.alertType = 'warning';
          this.alertMessage = x?.message?.[0] || 'A név nem található.';
          return;
        }

        const ref = this.modal.open(SelectNameComponent, {
          size: 'md',
          centered: true,
          backdrop: 'static',
        });

        // átadjuk a visszakapott nevet a modalnak
        ref.componentInstance.nameDto = x;

        // felhasználó döntése
        ref.result
          .then((res: { action: 'select' | 'throw'; name: typeof x }) => {
            if (!res) return;
            const param = new SelectNameParams({ id: x.id });
            if (res.action === 'select') {
              this.client.createSelectsName(param).pipe(take(1)).subscribe();
            } else if (res.action === 'throw') {
              this.client.createThrowedName(param).pipe(take(1)).subscribe();
            }
          })
          .catch(() => {});
      });
  }
}
