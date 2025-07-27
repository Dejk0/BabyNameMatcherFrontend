import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-name-card',
  imports: [],
  templateUrl: './name-card.component.html',
  styleUrl: './name-card.component.css',
})
export class NameCardComponent {
  @Input() name: string = '';
  @Input() gender: 'boy' | 'girl' | 'neutral' = 'neutral';
}
