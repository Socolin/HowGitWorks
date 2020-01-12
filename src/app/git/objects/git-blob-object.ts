import {IGitObject} from './git-object';
import {GitHash} from './types';

export class GitBlobObject implements IGitObject {
  public readonly type = 'blob';
  public readonly size: number;
  public readonly text: string;
  public readonly hash: GitHash;

  constructor(hash: GitHash, text: string, size: number) {
    this.hash = hash;
    this.size = size;
    this.text = text;
  }
}
