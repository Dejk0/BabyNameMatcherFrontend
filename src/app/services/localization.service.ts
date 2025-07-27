import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiClient, LocalizationParamsDto } from '../ApiClient';
import { AppLoc } from '../app.loc';

@Injectable({ providedIn: 'root' })
export class LocalizationService {
  private dictionary: Record<number, string> = {};

  constructor(private client: ApiClient) {}

  public loadLocalizations(languageCode: string): Promise<void> {
    return this.client
      .getLocalizations({
        languageCode,
        key: AppLoc,
      } as LocalizationParamsDto)
      .pipe(
        map((res) => {
          const locMap = res.localization ?? {};
          for (const key of Object.keys(locMap)) {
            this.dictionary[+key] = locMap[key];
          }
        })
      )
      .toPromise();
  }

  private reportedMissingKeys = new Set<number>();

  public get(key: number, fallback = `[missing:${key}]`): string {
    const value = this.dictionary[key];
    const dictionaryNotEmpty = Object.keys(this.dictionary).length > 0;
    if (
      dictionaryNotEmpty &&
      value === undefined &&
      !this.reportedMissingKeys.has(key)
    ) {
      console.warn(`🔍 Localization missing for key: ${key}`);
      // vagy: console.error(`❌ Missing localization key: ${key}`);
      this.reportedMissingKeys.add(key);
    }
    return value ?? fallback;
  }

  public getAll(): Record<number, string> {
    return this.dictionary;
  }
}
