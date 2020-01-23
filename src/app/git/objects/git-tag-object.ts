import {IGitObject} from './git-object';
import {GitHash} from './types';

export class GitTagObject implements IGitObject {
  hash: GitHash;
  type: 'tag';

  tagType: 'commit';
  tag: string;
  tagger: string;
  object: GitHash;
}
