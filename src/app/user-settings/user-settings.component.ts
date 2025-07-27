import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class UserSettingsComponent implements OnInit {
  settingsForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    language: new FormControl('hu'),
  });

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  save() {
    if (this.settingsForm.valid) {
      const settings = this.settingsForm.value;
      console.log('Mentett beállítások:', settings);
      this.activeModal.close(settings); // visszaküldheted a módosított adatokat
    }
  }

  close() {
    this.activeModal.dismiss(); // bezárás mentés nélkül
  }
}
