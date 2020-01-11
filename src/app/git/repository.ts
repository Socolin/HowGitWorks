import {GitIndex} from './git-index';
import {IGitObject} from './objects/git-object';
import {hash} from './objects/types';

export class Repository {
  private readonly defaultBranchName = 'master';

  index: GitIndex;
  objects: { [hash: string]: IGitObject };
  refs: {
    heads: { [name: string]: hash };
    tags: { [name: string]: hash };
  };
  HEAD: hash;
  config: {
    [sectionName: string]: {
      [key: string]: string
    }
  };
  branches: { [name: string]: string };

  constructor() {
    this.index = new GitIndex();
    this.objects = {};
    this.config = {};
  }
}
