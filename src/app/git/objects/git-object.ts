import {GitHash} from './types';

export type GitObjectType = 'blob' | 'commit' | 'tree';

export interface IGitObject {
  type: GitObjectType;
  hash: GitHash;
}
