import { Component, QueryList, ViewChildren } from '@angular/core';
import { TopMenuComponent } from '../top-menu/top-menu.component';
import { NameCardComponent } from '../name-card/name-card.component';
import {
  CdkDrag,
  CdkDragMove,
  CdkDragRelease,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ApiClient, HunNames, SelectNameParams } from '../ApiClient';
import { take, timestamp } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TopMenuComponent, NameCardComponent, DragDropModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @ViewChildren(CdkDrag) dragRefs!: QueryList<CdkDrag>;

  names: HunNames[] = [];

  private animationInterval: any;
  private scrollY = 0;
  private isDragging = false;

  constructor(private readonly client: ApiClient) {}

  ngOnInit() {
    this.client
      .getRandomNames()
      .pipe(take(1))
      .subscribe((x: HunNames[]) => {
        if (x) {
          x.map((y) => this.names.push(y));
        }
      });
    this.startAutoScroll();
    window.addEventListener('mousedown', this.onPointerDown);
    window.addEventListener('mouseup', this.onPointerUp);
    // Mobilon is működjön:
    window.addEventListener('touchstart', this.onPointerDown);
    window.addEventListener('touchend', this.onPointerUp);
  }

  ngOnDestroy() {
    clearInterval(this.animationInterval);

    window.removeEventListener('mousedown', this.onPointerDown);
    window.removeEventListener('mouseup', this.onPointerUp);
    window.removeEventListener('touchstart', this.onPointerDown);
    window.removeEventListener('touchend', this.onPointerUp);
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

  private lastPointerX: number = 0;
  private dragedPointX: number = 0;

  onPointerDown = () => {
    this.isDragging = true;
  };

  onPointerUp = () => {
    this.isDragging = false;
  };

  onDragEnd(index: number) {
    this.isDragging = false;
  }

  onDragMoved(event: CdkDragMove<any>, index: number) {
    if (this.lastPointerX === 0) {
      this.lastPointerX = event.pointerPosition.x;
    }
    this.dragedPointX = event.pointerPosition.x - this.lastPointerX;
  }

  onDragStart(index: number) {
    this.isDragging = true;
  }

  onDragReleased(event: CdkDragRelease, index: number) {
    const el = document.querySelector('.scroll-content') as HTMLElement;
    const w = parseInt(window.getComputedStyle(el).width, 10);
    const threshold = w * 0.4;

    const item = this.names[index];
    const id = item?.id;

    if (this.dragedPointX > 0) {
      if (this.dragedPointX >= threshold) {
        if (id != null) this.selectedById(id); // ← id-vel hívjuk
        this.names.splice(index, 1); // ← csak utána törlünk
      }
    } else {
      if (this.dragedPointX <= -threshold) {
        if (id != null) this.throwedById(id);
        this.names.splice(index, 1);
      }
    }

    const dragRef = this.dragRefs.toArray()[index];
    if (dragRef) dragRef.reset();

    this.lastPointerX = 0;
    this.dragedPointX = 0;
  }

  // — új, id-alapú metódusok —
  selectedById(id: number) {
    const params = new SelectNameParams({ id });
    this.client.createSelectsName(params).pipe(take(1)).subscribe();
  }

  throwedById(id: number) {
    const params = new SelectNameParams({ id });
    this.client.createThrowedName(params).pipe(take(1)).subscribe();
  }

  // (opcionális) kompatibilitási wrapper, ha máshol indexszel hívod:
  selected(index: number) {
    const id = this.names[index]?.id;
    if (id != null) this.selectedById(id);
  }
  throwed(index: number) {
    const id = this.names[index]?.id;
    if (id != null) this.throwedById(id);
  }

  deleteItem(index: number) {
    this.names.splice(index, 1);
  }
}
