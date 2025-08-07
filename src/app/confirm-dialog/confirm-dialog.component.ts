// confirm-dialog.component.ts
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalizationService } from '../services/localization.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Are you sure?';

  constructor(
    public activeModal: NgbActiveModal,
    public loc: LocalizationService
  ) {}
}
