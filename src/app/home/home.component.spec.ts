import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ApiClient, HunNames } from '../ApiClient';
import { of } from 'rxjs';
import { CdkDragMove, CdkDragRelease } from '@angular/cdk/drag-drop';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let apiClientMock: jasmine.SpyObj<ApiClient>;

  beforeEach(async () => {
    apiClientMock = jasmine.createSpyObj('ApiClient', ['getRandomNames']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [{ provide: ApiClient, useValue: apiClientMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load names on init', () => {
    const mockNames: HunNames[] = [
      { name: 'Anna' } as HunNames,
      { name: 'Béla' } as HunNames,
    ];
    apiClientMock.getRandomNames.and.returnValue(of(mockNames));

    component.ngOnInit();

    expect(component.names.length).toBe(2);
    expect(component.names[0].name).toBe('Anna');
  });

  it('should set lastPointerX on drag move', () => {
    const event = {
      pointerPosition: { x: 123 },
    } as CdkDragMove<any>;

    component.onDragMoved(event, 0);

    expect((component as any).lastPointerX).toBe(123);
  });

  it('should delete item if dragged beyond threshold', () => {
    component.names = [
      { name: 'Anna' } as HunNames,
      { name: 'Béla' } as HunNames,
    ];

    const mockColumnWidth = 300;
    const threshold = mockColumnWidth * 0.4;

    // DOM elem, amit a querySelector megtalál
    const scrollContent = document.createElement('div');
    scrollContent.classList.add('scroll-content');
    scrollContent.style.width = `${mockColumnWidth}px`;
    document.body.appendChild(scrollContent);

    // Mock: getComputedStyle
    spyOn(window, 'getComputedStyle').and.returnValue({
      width: `${mockColumnWidth}px`,
    } as any);

    // Állítsuk be a húzás irányát és hosszát
    (component as any).lastPointerX = 0;
    (component as any).dragedPointX = threshold + 10; // azaz jobbra húzunk túl a küszöbön

    // Mock: dragRefs, hogy ne dobjon hibát a .reset()
    const mockDragRef = { reset: jasmine.createSpy('reset') } as any;
    (component as any).dragRefs = {
      toArray: () => [mockDragRef, mockDragRef],
    } as any;

    // Hívás
    component.onDragReleased({} as CdkDragRelease, 0);

    // Ellenőrzés
    expect(component.names.length).toBe(1);
    expect(component.names[0].name).toBe('Béla');

    document.body.removeChild(scrollContent);
  });

  it('should NOT delete item if dragged below threshold', () => {
    component.names = [
      { name: 'Anna' } as HunNames,
      { name: 'Béla' } as HunNames,
    ];

    const mockColumnWidth = 300;
    const threshold = mockColumnWidth * 0.4;

    // DOM elem a scroll-containerhez
    const scrollContent = document.createElement('div');
    scrollContent.classList.add('scroll-content');
    scrollContent.style.width = `${mockColumnWidth}px`;
    document.body.appendChild(scrollContent);

    // Mock getComputedStyle, hogy visszaadja a szélességet
    spyOn(window, 'getComputedStyle').and.returnValue({
      width: `${mockColumnWidth}px`,
    } as any);

    // dragedPointX kisebb, mint a küszöb (pl. csak 10 pixel húzás)
    (component as any).lastPointerX = 0;
    (component as any).dragedPointX = threshold - 10; // threshold pl. 120, ez 110

    // Mock dragRefs, hogy ne dobjon hibát a reset()
    const mockDragRef = { reset: jasmine.createSpy('reset') } as any;
    (component as any).dragRefs = {
      toArray: () => [mockDragRef, mockDragRef],
    } as any;

    component.onDragReleased({} as CdkDragRelease, 0);

    // ❗ Ne töröljön egy elemet sem
    expect(component.names.length).toBe(2);
    expect(component.names[0].name).toBe('Anna');
    expect(component.names[1].name).toBe('Béla');

    document.body.removeChild(scrollContent);
  });

  it('should delete item at index', () => {
    component.names = [
      { name: 'Anna' } as HunNames,
      { name: 'Béla' } as HunNames,
    ];

    component.deleteItem(0);

    expect(component.names.length).toBe(1);
    expect(component.names[0].name).toBe('Béla');
  });

  it('should delete item if dragged beyond 40% of the scroll container width', () => {
    component.names = [
      { name: 'Anna' } as HunNames,
      { name: 'Béla' } as HunNames,
    ];

    const mockColumnWidth = 300;
    const threshold = mockColumnWidth * 0.4;

    // DOM elem, amit a querySelector megtalál
    const scrollContent = document.createElement('div');
    scrollContent.classList.add('scroll-content');
    scrollContent.style.width = `${mockColumnWidth}px`;
    document.body.appendChild(scrollContent);

    // Mock getComputedStyle, hogy a megfelelő szélességet adja vissza
    spyOn(window, 'getComputedStyle').and.returnValue({
      width: `${mockColumnWidth}px`,
    } as any);

    // Megszimuláljuk, hogy jobbra húzták (pozitív irányban)
    (component as any).lastPointerX = 0;
    (component as any).dragedPointX = threshold + 10; // túllépi a 40%-os küszöböt

    // dragRefs mockolása, hogy ne dobjon hibát a reset() hívásnál
    const mockDragRef = { reset: jasmine.createSpy('reset') } as any;
    (component as any).dragRefs = {
      toArray: () => [mockDragRef, mockDragRef],
    } as any;

    component.onDragReleased({} as CdkDragRelease, 0);

    expect(component.names.length).toBe(1);
    expect(component.names[0].name).toBe('Béla');

    document.body.removeChild(scrollContent);
  });
});
