import {Component, Input, OnInit} from '@angular/core';
import {GitTreeObject} from './git/objects/git-tree-object';
import {HighlightService} from './highlight-service';

@Component({
  selector: 'app-git-object-tree',
  templateUrl: './git-object-tree.component.html',
  styleUrls: ['./git-object-tree.component.scss', './object-highlightable.scss']
})
export class GitObjectTreeComponent implements OnInit {
  @Input() tree: GitTreeObject;

  constructor(
    public highlightService: HighlightService
  ) {
  }

  ngOnInit() {
  }

}
