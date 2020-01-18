import {Component, Input, OnInit} from '@angular/core';
import {GitIndex} from './git/git-index';
import {HighlightService} from './highlight-service';

@Component({
  selector: 'app-git-index',
  templateUrl: './git-index.component.html',
  styleUrls: ['./git-index.component.scss', './object-highlightable.scss']
})
export class GitIndexComponent implements OnInit {
  @Input() index: GitIndex;

  constructor(
    public highlightService: HighlightService
  ) {
  }

  ngOnInit() {
  }

}
