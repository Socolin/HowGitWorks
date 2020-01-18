import {Component, Input, OnInit} from '@angular/core';
import {GitCommitObject} from './git/objects/git-commit-object';
import {HighlightService} from './highlight-service';

@Component({
  selector: 'app-git-object-commit',
  templateUrl: './git-object-commit.component.html',
  styleUrls: ['./git-object-commit.component.scss', './object-highlightable.scss']
})
export class GitObjectCommitComponent implements OnInit {
  @Input() commit: GitCommitObject;

  constructor(
    public highlightService: HighlightService
  ) {
  }

  ngOnInit() {
  }

}
