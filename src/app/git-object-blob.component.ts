import {Component, Input, OnInit} from '@angular/core';
import {GitBlobObject} from './git/objects/git-blob-object';

@Component({
  selector: 'app-git-object-blob',
  templateUrl: './git-object-blob.component.html',
  styleUrls: ['./git-object-blob.component.scss', './object-highlightable.scss']
})
export class GitObjectBlobComponent implements OnInit {
  @Input() blob: GitBlobObject;

  constructor() {
  }

  ngOnInit() {
  }

}
