import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NameCardComponent } from '../name-card/name-card.component';
import { NameSelectrionResultDto } from '../ApiClient';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LocalizationService } from '../services/localization.service';

@Component({
  selector: 'app-select-name',
  imports: [CommonModule, NameCardComponent],
  templateUrl: './select-name.component.html',
  styleUrl: './select-name.component.css',
})
export class SelectNameComponent {
  @Input() nameDto?: NameSelectrionResultDto;

  constructor(
    public activeModal: NgbActiveModal,
    public loc: LocalizationService
  ) {}

  onChoose() {
    this.activeModal.close({ action: 'select', name: this.nameDto });
  }

  onThrow() {
    this.activeModal.close({ action: 'throw', name: this.nameDto });
  }
}
