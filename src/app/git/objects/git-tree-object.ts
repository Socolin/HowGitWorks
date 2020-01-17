import {IGitObject} from './git-object';
import {GitFileType, GitHash} from './types';

export interface GitTreeChild {
  mode: {
    type: GitFileType;
    perm: 0o0644 | 0o0755 | 0o0000;
  };
  objectHash: GitHash;
  path: string;
}

export class GitTreeObject implements IGitObject {
  public readonly type = 'tree';
  public readonly hash: GitHash;
  public readonly children: GitTreeChild[];

  constructor(hash: string, children: GitTreeChild[]) {
    this.hash = hash;
    this.children = children;
  }

  static fromSerialized(serialized: any): GitTreeObject {
    return new GitTreeObject(serialized.hash, serialized.children);
  }
}
