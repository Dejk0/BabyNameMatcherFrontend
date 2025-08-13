import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
export class MainfilterComponent implements OnInit {
  @Input() initial = null;

  @ViewChild('nameSearch') nameSearch!: ElementRef<HTMLElement>;
  letters = 'AÁBCDEÉFGHIÍJKLMNOÓÖŐPRSTUÚÜVXZ'.split('');
  searchNameController = new FormControl('', [Validators.required]);
  genderController = new FormControl<'' | 'M' | 'F'>('');
  charController = new FormControl('');

  alertMessage: string | null = null; // 👈 állapot
  alertType: 'success' | 'warning' | 'danger' | 'info' = 'danger';

  constructor(
    public activeModal: NgbActiveModal,
    private readonly modal: NgbModal,
    private readonly client: ApiClient,
    public readonly loc: LocalizationService
  ) {}

  genderGroup = new FormGroup({
    male: new FormControl(true),
    female: new FormControl(false),
  });

  ngOnInit() {
    const gender = localStorage.getItem('gender');
    if (gender) {
      if (gender === 'F') {
        this.genderController.setValue(gender);
      }
      if (gender === 'M') {
        this.genderController.setValue(gender);
      }
    }

    const savedChar = localStorage.getItem('char');
    if (savedChar) {
      this.charController.setValue(savedChar);
    }
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

  toggleGender(g: any) {
    const c = this.genderController;
    if (c.value === g) {
      c.setValue('');
    } else {
      c.setValue(g);
    }
    this.genderCtrl();
  }

  genderCtrl() {
    const gender = this.genderController.value;
    if (gender) {
      localStorage.setItem('gender', gender);
    } else {
      localStorage.setItem('gender', '');
    }
  }

  toggleStartChar(letter: string) {
    const c = this.charController;
    if (c.value === letter) {
      c.setValue('');
    } else {
      c.setValue(letter);
    }
    this.charCtrl();
  }

  charCtrl() {
    const char = this.charController.value;
    localStorage.setItem('char', char || '');
  }

  onClose() {
    const gender = this.genderController.value;
    const startChar = this.charController.value;
    const params = new NameSelectionFilterConditions({
      gender: gender?.toString(),
      startCharacter: startChar?.toString(),
    });

    this.activeModal.close(params);
  }
}
