import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { NamesListComponent } from './names-list.component';
import { ApiClient, BaseValidResponse, HunNames } from '../ApiClient';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LocalizationService } from '../services/localization.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

describe('NamesListComponent', () => {
  let component: NamesListComponent;
  let fixture: ComponentFixture<NamesListComponent>;

  let apiMock: jasmine.SpyObj<ApiClient>;
  let locMock: jasmine.SpyObj<LocalizationService>;
  let modalMock: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    apiMock = jasmine.createSpyObj<ApiClient>('ApiClient', [
      'getSelectedNames',
      'getThrowedNames',
      'changeSelectedName',
    ]);
    locMock = jasmine.createSpyObj<LocalizationService>('LocalizationService', [
      'get',
    ]);
    modalMock = jasmine.createSpyObj<NgbModal>('NgbModal', ['open']);

    // default mock returns
    apiMock.getSelectedNames.and.returnValue(of([]));
    apiMock.getThrowedNames.and.returnValue(of([]));
    apiMock.changeSelectedName.and.returnValue(of());
    locMock.get.and.callFake((_k: number, fallback: string) => fallback);
    // modal.open() -> result resolved true (user confirms)
    modalMock.open.and.returnValue({
      componentInstance: {} as any,
      result: Promise.resolve(true),
    } as any);

    await TestBed.configureTestingModule({
      imports: [NamesListComponent], // standalone
      providers: [
        { provide: ApiClient, useValue: apiMock },
        { provide: LocalizationService, useValue: locMock },
        { provide: NgbModal, useValue: modalMock },
        NgbActiveModal, // sima instance elég
      ],
      schemas: [NO_ERRORS_SCHEMA], // gyerek komponenseket ignoráljuk
    }).compileComponents();

    fixture = TestBed.createComponent(NamesListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set placeholder from localization on init', () => {
    locMock.get.and.returnValue('Search by name… (hu)');
    fixture.detectChanges(); // ngOnInit
    expect(component.placeholder).toBe('Search by name… (hu)');
    expect(locMock.get).toHaveBeenCalledWith(42, 'Search by name…');
  });

  it('should load selected names when isThrowedNames is false', () => {
    const data: HunNames[] = [
      { id: 1, name: 'Anna' } as any,
      { id: 2, name: 'Béla' } as any,
    ];
    apiMock.getSelectedNames.and.returnValue(of(data));

    component.isThrowedNames = false;
    fixture.detectChanges(); // ngOnInit -> load()

    expect(apiMock.getSelectedNames).toHaveBeenCalled();
    expect(component.names.length).toBe(2);
    expect(component.names[0].name).toBe('Anna');
  });

  it('should load throwed names when isThrowedNames is true', () => {
    const data: HunNames[] = [{ id: 3, name: 'Csaba' } as any];
    apiMock.getThrowedNames.and.returnValue(of(data));

    component.isThrowedNames = true;
    fixture.detectChanges(); // ngOnInit -> load()

    expect(apiMock.getThrowedNames).toHaveBeenCalled();
    expect(component.names.length).toBe(1);
    expect(component.names[0].name).toBe('Csaba');
  });

  it('filteredNames should return all when search is empty', () => {
    component.names = [
      { id: 1, name: 'Anna' } as any,
      { id: 2, name: 'Béla' } as any,
      { id: 3, name: 'Csilla' } as any,
    ];
    component.searchCtrl.setValue('');
    expect(component.filteredNames.map((n) => n.name)).toEqual([
      'Anna',
      'Béla',
      'Csilla',
    ]);
  });

  it('filteredNames should filter by substring (case-insensitive)', () => {
    component.names = [
      { id: 1, name: 'Anna' } as any,
      { id: 2, name: 'Béla' } as any,
      { id: 3, name: 'Csilla' } as any,
    ];
    component.searchCtrl.setValue('ll');
    expect(component.filteredNames.map((n) => n.name)).toEqual(['Csilla']);

    component.searchCtrl.setValue('AN'); // case-insensitive
    expect(component.filteredNames.map((n) => n.name)).toEqual(['Anna']);
  });

  it('onClick should open confirm modal and on confirm call changeSelectedName then reload', async () => {
    component.names = [
      { id: 10, name: 'Dóra' } as any,
      { id: 11, name: 'Eszter' } as any,
    ];
    const loadSpy = spyOn(component, 'load').and.stub();

    modalMock.open.and.returnValue({
      componentInstance: {} as any,
      result: Promise.resolve(true),
    } as any);
    apiMock.changeSelectedName.and.returnValue(of({} as BaseValidResponse));

    component.onClick(component.names[0]);

    // várj minden pending Promise-ra (modal.result)
    await fixture.whenStable();

    expect(modalMock.open).toHaveBeenCalled();
    expect(apiMock.changeSelectedName).toHaveBeenCalledWith(10);
    expect(component.names.length).toBe(0);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('confirmAndThrow should NOT call API if user cancels', async () => {
    // modal most cancel-t ad
    modalMock.open.and.returnValue({
      componentInstance: {} as any,
      result: Promise.reject('cancel'),
    } as any);

    component.names = [{ id: 5, name: 'Fanni' } as any];
    const loadSpy = spyOn(component, 'load').and.callFake(() => {});

    await component.confirmAndThrow(5).catch(() => {
      /* elnyeljük a rejectet a tesztben */
    });

    expect(apiMock.changeSelectedName).not.toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
  });
});
