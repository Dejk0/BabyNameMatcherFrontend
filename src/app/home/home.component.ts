import { Component } from '@angular/core';
import { TopMenuComponent } from '../top-menu/top-menu.component';
import { NameCardComponent } from '../name-card/name-card.component';
import {
  CdkDragMove,
  CdkDragRelease,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TopMenuComponent, NameCardComponent, DragDropModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  names = [
    { name: 'Máté', gender: 'boy' },
    { name: 'Lili', gender: 'girl' },
    { name: 'Alex', gender: 'neutral' },
    { name: 'Máté', gender: 'boy' },
    { name: 'Lili', gender: 'girl' },
    { name: 'Alex', gender: 'neutral' },
    { name: 'Máté', gender: 'boy' },
    { name: 'Lili', gender: 'girl' },
    { name: 'Alex', gender: 'neutral' },
  ];
  private animationInterval: any;
  private scrollY = 0;
  private isDragging = false;

  ngOnInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    clearInterval(this.animationInterval);
  }

  startAutoScroll() {
    this.animationInterval = setInterval(() => {
      if (!this.isDragging) {
        this.scrollY -= 0.5; // sebesség
        const el = document.querySelector('.scroll-content') as HTMLElement;
        if (el) {
          el.style.transform = `translateY(${this.scrollY}px)`;

          // ha teljesen elfogyott, reseteljük
          if (Math.abs(this.scrollY) > el.scrollHeight / 2) {
            this.scrollY = 0;
          }
        }
      }
    }, 1); // kb. 60fps
  }

  onDragStart() {
    this.isDragging = true;
  }

  onDragEnd() {
    this.isDragging = false;
  }

  private lastPointerX: number = 0;

  onDragMoved(event: CdkDragMove<any>, index: number) {
    this.lastPointerX = event.pointerPosition.x;
  }

  onDragReleased(event: CdkDragRelease, index: number) {
    const screenWidth = window.innerWidth;
    const threshold = screenWidth * 0.9;

    if (this.lastPointerX >= threshold) {
      this.names.splice(index, 1);
    }

    this.lastPointerX = 0; // reset
  }

  deleteItem(index: number) {
    this.names.splice(index, 1);
  }
}
