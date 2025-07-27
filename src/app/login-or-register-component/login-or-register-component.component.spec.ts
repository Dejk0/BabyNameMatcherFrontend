import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginOrRegisterComponentComponent } from './login-or-register-component.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiClient } from '../ApiClient';
import { LocalizationService } from '../services/localization.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('LoginOrRegisterComponentComponent', () => {
  let component: LoginOrRegisterComponentComponent;
  let fixture: ComponentFixture<LoginOrRegisterComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginOrRegisterComponentComponent, // ✅ standalone -> imports
        HttpClientTestingModule,
        ReactiveFormsModule,
      ],
      providers: [LocalizationService, ApiClient, NgbActiveModal],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginOrRegisterComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
