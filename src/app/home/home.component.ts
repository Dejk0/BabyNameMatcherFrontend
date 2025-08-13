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
import {
  ApiClient,
  NameSelectionFilterConditions,
  NameSelectrionResultDto,
  SelectNameParams,
} from '../ApiClient';
import { take, timestamp } from 'rxjs';
import { MainfilterComponent } from '../mainfilter/mainfilter.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TopMenuComponent, NameCardComponent, DragDropModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  @ViewChildren(CdkDrag) dragRefs!: QueryList<CdkDrag>;

  names: NameSelectrionResultDto[] = [];
  quantity = 20;
  private animationInterval: any;
  private scrollY = 0;
  private isDragging = false;

  constructor(
    private readonly client: ApiClient,
    private readonly modal: NgbModal
  ) {}

  load(params: NameSelectionFilterConditions) {
    if (params?.gender === '' && params?.startCharacter === '') {
      params = new NameSelectionFilterConditions();
    }
    params.quantity = this.quantity;
    this.client
      .getRandomNames(params)
      .pipe(take(1))
      .subscribe((x: NameSelectrionResultDto[]) => {
        if (x) {
          this.names = [];
          x.map((y) => this.names.push(y));
        }
      });
  }
  ngOnInit() {
    const params = new NameSelectionFilterConditions();
    const gender = localStorage.getItem('gender');
    if (gender) {
      if (gender === 'F') {
        params.gender = gender;
      }
      if (gender === 'M') {
        params.gender = gender;
      }
    }
    const letters = 'AÁBCDEÉFGHIÍJKLMNOÓÖŐPRSTUÚÜVXZ'.split('');
    const startChar = localStorage.getItem('char');
    if (startChar) {
      if (letters.includes(startChar)) {
        params.startCharacter = startChar;
      }
    }
    this.load(params);

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

  private currentItemLimit = 0;

  private getItemHeight(index = 0): number {
    const wrappers = document.querySelectorAll('.draggable-wrapper');
    if (!wrappers.length || !wrappers[index]) return 0;
    const w = wrappers[index] as HTMLElement;
    const r = w.getBoundingClientRect();
    const cs = getComputedStyle(w);
    const mt = parseFloat(cs.marginTop || '0');
    const mb = parseFloat(cs.marginBottom || '0');
    return r.height + mt + mb;
  }

  startAutoScroll() {
    this.animationInterval = setInterval(() => {
      const el = document.querySelector('.scroll-content') as HTMLElement;
      if (!el) return;

      const windowHeight = window.innerHeight;
      if (!this.isDragging && el.scrollHeight > windowHeight - 50) {
        // 1) ha még nincs limit, mérjük meg az első (index 0) wrappert
        if (!this.currentItemLimit) {
          this.currentItemLimit = this.getItemHeight(0);
        }

        // 2) léptetés
        this.scrollY -= 0.5;

        // 3) ha átléptük a TÉNYLEGES első elem magasságát: törlés + overshoot korrekció
        if (Math.abs(this.scrollY) >= this.currentItemLimit) {
          this.names.shift();

          // hagyd meg a finom „túlfutás” megőrzését, de pontos magassággal
          const overshoot = Math.abs(this.scrollY) - this.currentItemLimit;
          this.scrollY = -overshoot;

          // 4) új limit a következő első elemre
          this.currentItemLimit = this.getItemHeight(0);
        }

        el.style.transform = `translateY(${this.scrollY}px)`;
      } else {
        this.scrollY = 0;
        this.currentItemLimit = 0; // reset
        el.style.transform = `translateY(0px)`;
      }
    }, 1);
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

  openFilterDialog() {
    const ref = this.modal.open(MainfilterComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static',
    });

    ref.result
      .then((result: NameSelectionFilterConditions) => {
        if (result) {
          if (result.gender !== 'F' && result.gender !== 'M') {
            result.gender = undefined;
          }
          if (!result.startCharacter) {
            result.startCharacter = undefined;
          }
          this.load(result);
        }
      })
      .catch(() => {});
  }
}
