import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ApiClient, HunNames } from '../ApiClient';
import { of } from 'rxjs';
import {
  CdkDragMove,
  CdkDragRelease,
  DragDropModule,
} from '@angular/cdk/drag-drop';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let apiClientMock: jasmine.SpyObj<ApiClient>;

  beforeEach(async () => {
    apiClientMock = jasmine.createSpyObj<ApiClient>('ApiClient', [
      'getRandomNames',
      'createSelectsName',
      'createThrowedName',
    ]);

    apiClientMock.getRandomNames.and.returnValue(of([]));
    apiClientMock.createSelectsName.and.returnValue(of());
    apiClientMock.createThrowedName.and.returnValue(of());

    await TestBed.configureTestingModule({
      imports: [HomeComponent, DragDropModule],
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
      { id: 1, name: 'Anna' } as HunNames,
      { id: 2, name: 'Béla' } as HunNames,
    ];
    apiClientMock.getRandomNames.and.returnValue(of(mockNames));

    component.ngOnInit();

    expect(component.names.length).toBe(2);
    expect(component.names[0].name).toBe('Anna');
  });

  it('should set lastPointerX on first drag move', () => {
    const event = { pointerPosition: { x: 123 } } as CdkDragMove<any>;
    (component as any).lastPointerX = 0;

    component.onDragMoved(event, 0);

    expect((component as any).lastPointerX).toBe(123);
  });

  it('should NOT delete item if dragged below threshold', () => {
    component.names = [
      { id: 1, name: 'Anna' } as HunNames,
      { id: 2, name: 'Béla' } as HunNames,
    ];

    const mockColumnWidth = 300;
    const threshold = mockColumnWidth * 0.4;

    const scrollContent = document.createElement('div');
    scrollContent.classList.add('scroll-content');
    scrollContent.style.width = `${mockColumnWidth}px`;
    document.body.appendChild(scrollContent);

    spyOn(window, 'getComputedStyle').and.returnValue({
      width: `${mockColumnWidth}px`,
    } as any);

    (component as any).lastPointerX = 0;
    (component as any).dragedPointX = threshold - 10;

    const mockDragRef = { reset: jasmine.createSpy('reset') } as any;
    (component as any).dragRefs = {
      toArray: () => [mockDragRef, mockDragRef],
    } as any;

    component.onDragReleased({} as CdkDragRelease, 0);

    expect(component.names.length).toBe(2);
    expect(component.names[0].name).toBe('Anna');
    expect(component.names[1].name).toBe('Béla');

    document.body.removeChild(scrollContent);
  });

  it('should delete item at index', () => {
    component.names = [
      { id: 1, name: 'Anna' } as HunNames,
      { id: 2, name: 'Béla' } as HunNames,
    ];

    component.deleteItem(0);

    expect(component.names.length).toBe(1);
    expect(component.names[0].name).toBe('Béla');
  });

  it('should delete item if dragged RIGHT beyond 40% of container width and call createSelectsName', () => {
    component.names = [
      { id: 1, name: 'Anna' } as any,
      { id: 2, name: 'Béla' } as any,
    ];

    const mockColumnWidth = 300;
    const threshold = mockColumnWidth * 0.4;

    const scrollContent = document.createElement('div');
    scrollContent.classList.add('scroll-content');
    scrollContent.style.width = `${mockColumnWidth}px`;
    document.body.appendChild(scrollContent);

    spyOn(window, 'getComputedStyle').and.returnValue({
      width: `${mockColumnWidth}px`,
    } as any);

    (component as any).lastPointerX = 0;
    (component as any).dragedPointX = threshold + 10; // jobbra túl a küszöbön

    const mockDragRef = { reset: jasmine.createSpy('reset') } as any;
    (component as any).dragRefs = {
      toArray: () => [mockDragRef, mockDragRef],
    } as any;

    component.onDragReleased({} as CdkDragRelease, 0);

    expect(component.names.length).toBe(1);
    expect(component.names[0].name).toBe('Béla');

    expect(apiClientMock.createSelectsName).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 1 })
    );

    document.body.removeChild(scrollContent);
  });

  it('should delete item if dragged LEFT beyond 40% of container width and call createThrowedName', () => {
    component.names = [
      { id: 1, name: 'Anna' } as any,
      { id: 2, name: 'Béla' } as any,
    ];

    const mockColumnWidth = 300;
    const threshold = mockColumnWidth * 0.4;

    const scrollContent = document.createElement('div');
    scrollContent.classList.add('scroll-content');
    scrollContent.style.width = `${mockColumnWidth}px`;
    document.body.appendChild(scrollContent);

    spyOn(window, 'getComputedStyle').and.returnValue({
      width: `${mockColumnWidth}px`,
    } as any);

    (component as any).lastPointerX = 0;
    (component as any).dragedPointX = -(threshold + 10); // balra túl a küszöbön

    const mockDragRef = { reset: jasmine.createSpy('reset') } as any;
    (component as any).dragRefs = {
      toArray: () => [mockDragRef, mockDragRef],
    } as any;

    component.onDragReleased({} as CdkDragRelease, 0);

    expect(component.names.length).toBe(1);
    // balra dobásnál az első (Anna) esik ki
    expect(component.names[0].name).toBe('Béla');

    expect(apiClientMock.createThrowedName).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 1 })
    );

    document.body.removeChild(scrollContent);
  });
});
