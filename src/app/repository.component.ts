import {Component, Input, OnInit} from '@angular/core';
import {Repository} from './git/repository';
import {HighlightService} from './highlight-service';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss', './object-highlightable.scss'],
})
export class RepositoryComponent implements OnInit {
  @Input() repository: Repository;
  public expandedFile: { [path: string]: boolean } = {};

  constructor(
    public highlightService: HighlightService
  ) {
  }

  toggleExpandFile(path: string) {
    this.expandedFile[path] = !this.expandedFile[path];
  }

  ngOnInit() {
  }

}
