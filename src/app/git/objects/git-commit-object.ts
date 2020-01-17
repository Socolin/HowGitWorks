import {GitHash} from './types';
import {IGitObject} from './git-object';

export class GitCommitObject implements IGitObject {
  readonly type = 'commit';
  readonly parents?: GitHash[];
  readonly author: string;
  readonly committer: string;
  readonly timestamp: number;
  readonly timezone: string;
  readonly message: string;
  readonly hash: GitHash;

  constructor(
    hash: GitHash,
    message: string,
    author: string,
    committer: string,
    timestamp: number,
    timezone: string,
    parents?: GitHash[]
  ) {
    this.hash = hash;
    this.message = message;
    this.author = author;
    this.committer = committer;
    this.timestamp = timestamp;
    this.timezone = timezone;
    this.parents = parents;
  }

  static fromSerialized(serialized: any) {
    return new GitCommitObject(
      serialized.hash,
      serialized.message,
      serialized.author,
      serialized.committer,
      serialized.timestamp,
      serialized.timezone,
      serialized.parents
    );
  }
}
