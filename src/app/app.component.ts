import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LocalizationService } from './services/localization.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'my-app';

  constructor() {}
}
