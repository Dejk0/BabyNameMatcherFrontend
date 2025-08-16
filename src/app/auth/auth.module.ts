import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, take, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ApiClient,
  GetFamilyNameResult,
  LoginParamsDto,
  TokenResponse,
} from '../ApiClient';
import { jwtDecode } from 'jwt-decode'; // ✅ Ez működik ESM alatt

interface TokenPayload {
  sub: string;
  jti: string;
  nameid: string;
  name?: string;
  username?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  public readonly TOKEN_KEY = 'access_token';
  public username: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public userSelectedFamilyname: BehaviorSubject<string> =
    new BehaviorSubject<string>('');

  constructor(private client: ApiClient) {}

  login(email: string, password: string): Observable<TokenResponse> {
    return this.client.login({ email, password } as LoginParamsDto).pipe(
      tap((response: TokenResponse) => {
        if (response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);

          const decoded = jwtDecode<TokenPayload>(response.token);
          const username = decoded.name ?? decoded.username;
          if (username) {
            this.username?.next(username);
          }
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.userSelectedFamilyname.next('');
  }

  getUserName() {
    return this.username?.value;
  }

  get token(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      const decoded = jwtDecode<TokenPayload>(token);
      if (decoded.username) {
        this.username?.next(decoded.username);
      }
    }

    return localStorage.getItem(this.TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const now = Date.now().valueOf() / 1000;
      return decoded.exp < now;
    } catch (e) {
      return true;
    }
  }

  refresFamilyName(): Observable<string | null> {
    this.client
      .getFamilyname()
      .pipe(take(1))
      .subscribe((x: GetFamilyNameResult) => {
        if (x.isValid && x.familyName) {
          this.userSelectedFamilyname.next(x.familyName);
        }
        return this.userSelectedFamilyname.asObservable();
      });
    return this.userSelectedFamilyname.asObservable();
  }
}
