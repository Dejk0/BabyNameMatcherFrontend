// app.config.ts
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { AuthInterceptor } from './auth/interceptor';
import { ApiClient, API_BASE_URL } from './ApiClient';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LangInterceptor } from './lang/lang.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // fontos!
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: LangInterceptor, multi: true },
    ApiClient,
    {
      provide: API_BASE_URL,
      useValue: 'http://localhost:5053',
    },
    provideAnimations(),
  ],
};
