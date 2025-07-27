import { Pipe, PipeTransform } from '@angular/core';
import { LocalizationService } from '../services/localization.service';

@Pipe({
  name: 'loc',
  standalone: true,
  pure: true,
})
export class LocPipe implements PipeTransform {
  constructor(private store: LocalizationService) {}

  transform(key: number, fallback: string): string {
    return this.store.get(key, fallback);
  }
}
