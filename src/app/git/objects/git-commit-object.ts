import {GitHash} from './types';
import {IGitObject} from './git-object';

export class GitCommitObject implements IGitObject {
  public readonly type = 'commit';
  readonly parent?: GitHash;
  readonly author: string;
  readonly committer: string;
  readonly message: string;
}
