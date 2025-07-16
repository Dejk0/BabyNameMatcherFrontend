import { Component } from '@angular/core';
import { TopMenuComponent } from '../top-menu/top-menu.component';

@Component({
  selector: 'app-home',
  imports: [TopMenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
