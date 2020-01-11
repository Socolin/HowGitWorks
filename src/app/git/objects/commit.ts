import {hash} from './types';
import {IGitObject} from './git-object';

export class Commit implements IGitObject {
  public readonly type = 'commit';
  readonly parent?: hash;
  readonly author: string;
  readonly committer: string;
  readonly message: string;
}
