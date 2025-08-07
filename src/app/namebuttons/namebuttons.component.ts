import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-namebuttons',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './namebuttons.component.html',
  styleUrl: './namebuttons.component.css',
})
export class NamebuttonsComponent {
  @Input() name?: string = '';
  @Input() familyName: string = '';
  @Input() gender? = '';

  @Output() clicked = new EventEmitter<void>();
  onClicked() {
    this.clicked.emit();
  }
}
