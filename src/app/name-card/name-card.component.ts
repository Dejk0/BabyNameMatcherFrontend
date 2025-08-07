import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-name-card',
  imports: [CommonModule],
  templateUrl: './name-card.component.html',
  styleUrl: './name-card.component.css',
})
export class NameCardComponent {
  @Input() name?: string = '';
  @Input() familyName: string = '';
  @Input() gender? = '';
}
