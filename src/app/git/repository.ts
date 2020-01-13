import {GitIndex} from './git-index';
import {IGitObject} from './objects/git-object';
import {GitHash} from './objects/types';

const defaultBranchName = 'master';

export class Repository {

  index: GitIndex;
  objects: { [hash: string]: IGitObject };
  refs: {
    heads: { [name: string]: GitHash };
    tags: { [name: string]: GitHash };
  };
  HEAD: GitHash|string = 'ref: refs/heads/master';
  config: {
    [sectionName: string]: {
      [key: string]: string
    }
  };

  constructor() {
    this.index = new GitIndex();
    this.objects = {};
    this.config = {};
  }
}
