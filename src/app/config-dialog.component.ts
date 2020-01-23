import {Component, OnInit} from '@angular/core';
import {AppConfigService} from './app-config.service';

@Component({
  selector: 'app-config-dialog',
  templateUrl: './config-dialog.component.html',
  styleUrls: ['./config-dialog.component.scss']
})
export class ConfigDialogComponent implements OnInit {

  constructor(
    public readonly appConfigService: AppConfigService
  ) {
  }

  ngOnInit() {
  }

}
