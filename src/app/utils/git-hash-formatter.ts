import {Injectable} from '@angular/core';
import {AppConfigService} from '../app-config.service';

@Injectable()
export class GitHashFormatter {
  constructor(private readonly appConfigService: AppConfigService) {
  }

  public format(hash: string): string {
    if (this.appConfigService.shortHash) {
      return hash.substr(0, 7);
    }
    return hash;
  }
}
