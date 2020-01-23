import {GitHash} from './types';

export type GitObjectType = 'blob' | 'commit' | 'tree' | 'tag';

export interface IGitObject {
  type: GitObjectType;
  hash: GitHash;
}
