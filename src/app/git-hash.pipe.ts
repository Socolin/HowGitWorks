import {Pipe, PipeTransform} from '@angular/core';
import {AppConfigService} from './app-config.service';

@Pipe({
  name: 'gitHash',
  pure: false
})
export class GitHashPipe implements PipeTransform {
  constructor(private readonly appConfigService: AppConfigService) {
  }

  transform(value: any, ...args: any[]): any {
    if (this.appConfigService.shortHash) {
      return value.substr(0, 7);
    }
    return value;
  }

}
