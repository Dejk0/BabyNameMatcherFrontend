import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { LocalizationService } from '../services/localization.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  let locMock: jasmine.SpyObj<LocalizationService>;
  let activeModalMock: jasmine.SpyObj<NgbActiveModal>;

  beforeEach(async () => {
    locMock = jasmine.createSpyObj<LocalizationService>('LocalizationService', [
      'get',
    ]);
    // Alapértelmezetten adja vissza a fallbacket
    locMock.get.and.callFake((_k: number, fallback: string) => fallback);

    activeModalMock = jasmine.createSpyObj<NgbActiveModal>('NgbActiveModal', [
      'close',
      'dismiss',
    ]);

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent], // standalone
      providers: [
        { provide: LocalizationService, useValue: locMock },
        { provide: NgbActiveModal, useValue: activeModalMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render default title and message, and localized button labels', () => {
    // Alapértelmezett @Input értékek
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.modal-title')!;
    const msg = el.querySelector('.modal-body p')!;
    const yesBtn = el.querySelector('.btn.btn-danger') as HTMLButtonElement;
    const noBtn = el.querySelector('.btn.btn-secondary') as HTMLButtonElement;

    expect(title.textContent?.trim()).toBe('Confirmation');
    expect(msg.textContent?.trim()).toBe('Are you sure?');

    // loc.get hívások (37, 38) → fallback feliratok
    expect(yesBtn.textContent?.trim()).toBe('Yes');
    expect(noBtn.textContent?.trim()).toBe('No');

    expect(locMock.get).toHaveBeenCalledWith(37, 'Yes');
    expect(locMock.get).toHaveBeenCalledWith(38, 'No');
  });

  it('should render custom title and message when inputs are provided', () => {
    component.title = 'Egyedi cím';
    component.message = 'Biztos vagy benne?';
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.modal-title')!;
    const msg = el.querySelector('.modal-body p')!;

    expect(title.textContent?.trim()).toBe('Egyedi cím');
    expect(msg.textContent?.trim()).toBe('Biztos vagy benne?');
  });

  it('should call activeModal.close(true) when YES clicked', () => {
    const el: HTMLElement = fixture.nativeElement;
    const yesBtn = el.querySelector('.btn.btn-danger') as HTMLButtonElement;

    yesBtn.click();
    fixture.detectChanges();

    expect(activeModalMock.close).toHaveBeenCalledWith(true);
    expect(activeModalMock.dismiss).not.toHaveBeenCalled();
  });

  it('should call activeModal.dismiss(false) when NO clicked', () => {
    const el: HTMLElement = fixture.nativeElement;
    const noBtn = el.querySelector('.btn.btn-secondary') as HTMLButtonElement;

    noBtn.click();
    fixture.detectChanges();

    expect(activeModalMock.dismiss).toHaveBeenCalledWith(false);
    expect(activeModalMock.close).not.toHaveBeenCalled();
  });

  it('should call activeModal.dismiss(false) when header close (X) clicked', () => {
    const el: HTMLElement = fixture.nativeElement;
    const xBtn = el.querySelector('.btn-close') as HTMLButtonElement;

    xBtn.click();
    fixture.detectChanges();

    expect(activeModalMock.dismiss).toHaveBeenCalledWith(false);
  });
});
