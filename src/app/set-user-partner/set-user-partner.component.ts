import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NgbActiveModal,
  NgbAlertModule,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import {
  ApiClient,
  GetUserTokenLinkResultDto,
  SetUserPartnerParamsDto,
} from '../ApiClient';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  finalize,
  firstValueFrom,
  take,
  tap,
} from 'rxjs';
import { LocalizationService } from '../services/localization.service';

type Mode = 'email' | 'token' | 'delete';

@Component({
  selector: 'app-set-user-partner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbAlertModule],
  templateUrl: './set-user-partner.component.html',
  styleUrls: ['./set-user-partner.component.css'],
})
export class SetUserPartnerComponent implements OnInit {
  mode = signal<Mode>('token');

  emailForm = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  tokenForm = new FormGroup({
    token: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  // Saját token/link megjelenítéséhez
  myToken = signal<string>('');
  myLink = signal<string>('');
  loading = new BehaviorSubject<boolean>(false);

  // UI üzenetek
  alertType = signal<'success' | 'warning' | 'danger' | null>(null);
  alertMsg = signal<string | null>(null);
  canGenerateNew = signal<boolean>(false);
  tokenInputPlaceHolder = '';

  constructor(
    private client: ApiClient,
    public activeModal: NgbActiveModal,
    public loc: LocalizationService
  ) {}

  ngOnInit(): void {
    this.loadOwnLink();
    this.tokenInputPlaceHolder = this.loc.get(
      1077,
      "Insert your partner's token"
    );
  }

  setMode(m: Mode) {
    this.mode.set(m);
    this.clearAlert();
  }

  loadOwnLink() {
    this.loading.next(true);
    const res: any = this.client
      .getUserTokenLink()
      .pipe(take(1))
      .subscribe((res: GetUserTokenLinkResultDto) => {
        if (res) {
          this.myToken.set(res.tokenLink ?? '');
        }
      });
    this.loading.next(false);
  }

  sendInviteEmail() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const email = this.emailForm.controls.email.value;
    this.loading.next(true);
    this.clearAlert();
    this.client
      .setUserPartnerWithEmail(new SetUserPartnerParamsDto({ email: email }))
      .pipe(
        take(1),
        tap(() => {
          this.success('Email elküldve');
        }),
        catchError((err) => {
          console.error(err);
          this.error('Sikertelen email küldés');
          return EMPTY;
        })
      )
      .subscribe((x) => {
        console.log(x);
      });
  }

  connectWithToken() {
    if (this.tokenForm.invalid) {
      this.tokenForm.markAllAsTouched();
      return;
    }
    this.loading.next(true);
    this.clearAlert();
    try {
      const token = this.tokenForm.controls.token.value!;
      firstValueFrom(
        this.client.setUserpartnerWithLinkToken(
          new SetUserPartnerParamsDto({ linkToken: token })
        )
      );
      this.success('Sikeres összekapcsolás tokennel.');
    } catch {
      this.error(
        'Az összekapcsolás sikertelen (érvénytelen vagy lejárt token?).'
      );
    } finally {
      this.loading.next(false);
    }
  }

  disconnect() {
    if (!confirm('Biztosan megszünteted az összekapcsolást?')) return;

    this.loading.next(true);
    this.clearAlert();

    this.client
      .clearUserPairId()
      .pipe(
        tap(() => {
          this.success('Összekapcsolás törölve.');
        }),
        catchError((err) => {
          console.error(err);
          this.error('A bontás sikertelen.');
          return EMPTY;
        }),
        finalize(() => this.loading.next(false))
      )
      .subscribe();
  }

  selectAll(el: HTMLInputElement) {
    el.select();
  }

  copy(text: string) {
    navigator.clipboard.writeText(text);
    this.info('Kimásolva a vágólapra.');
  }

  close() {
    this.activeModal.close();
  }

  // --- alert helper-ek ---
  private clearAlert() {
    this.alertType.set(null);
    this.alertMsg.set(null);
  }
  private success(m: string) {
    this.alertType.set('success');
    this.alertMsg.set(m);
  }
  private info(m: string) {
    this.alertType.set('warning');
    this.alertMsg.set(m);
  }
  private error(m: string) {
    this.alertType.set('danger');
    this.alertMsg.set(m);
  }
}
