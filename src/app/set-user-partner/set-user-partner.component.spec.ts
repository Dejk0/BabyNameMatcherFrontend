import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetUserPartnerComponent } from './set-user-partner.component';

describe('SetUserPartnerComponent', () => {
  let component: SetUserPartnerComponent;
  let fixture: ComponentFixture<SetUserPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetUserPartnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetUserPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
