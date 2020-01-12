import {IGitObject} from './git-object';
import {GitHash} from './types';

export class GitTreeObject implements IGitObject {
  public readonly type = 'tree';
  public readonly objects: {
    mode: string,
    path: string,
    objectHash: GitHash
  }[];
}
