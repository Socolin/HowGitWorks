import {Component, Input, OnInit} from '@angular/core';
import {File} from './models/files';

@Component({
  selector: 'app-filesystem-node',
  templateUrl: './filesystem-node.component.html',
  styleUrls: ['./filesystem-node.component.scss']
})
export class FilesystemNodeComponent implements OnInit {
  @Input()
  file: File;

  constructor() {
  }

  ngOnInit() {
  }

}
