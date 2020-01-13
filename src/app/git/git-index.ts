import {GitHash} from './objects/types';

export enum IndexType {
  File = 0,
}

export interface IndexEntry {
  path: string;
  objectHash: GitHash;
  mode: string;
  type: IndexType;
}

export class GitIndex {
  files: IndexEntry[] = [];
}
