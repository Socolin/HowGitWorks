import {GitHash} from './objects/types';

export interface IndexEntry {
  path: string;
  objectHash: GitHash;
  mode: string;
  type: 'file';
}

export class GitIndex {
  files: IndexEntry[] = [];
}
