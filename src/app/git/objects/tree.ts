import {IGitObject} from './git-object';
import {hash} from './types';

export class Tree implements IGitObject {
  public readonly type = 'tree';
  public readonly objects: {
    mode: string,
    path: string,
    objectHash: hash
  }[];
}
