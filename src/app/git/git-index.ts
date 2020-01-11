import {hash} from './objects/types';

export class GitIndex {
  files: {path: string, objectHash: hash}[];
}
