import {GitFileType, GitHash} from './objects/types';

// Based on https://github.com/git/git/blob/master/Documentation/technical/index-format.txt


// https://github.com/git/git/blob/master/Documentation/technical/index-format.txt#L38
export interface IndexEntry {
  // https://github.com/git/git/blob/master/Documentation/technical/index-format.txt#L107
  path: string;
  // https://github.com/git/git/blob/master/Documentation/technical/index-format.txt#L85
  objectHash: GitHash;
  // https://github.com/git/git/blob/master/Documentation/technical/index-format.txt#L71
  mode: 0o0644 | 0o0755 | 0o0000;
  // https://github.com/git/git/blob/master/Documentation/technical/index-format.txt#L65
  type: GitFileType;
  // Followings fields are unused in this project for now, I just put them here fore reference
  flags: {
    stage?: number;
    nameLength?: number;
    skipWorkTree?: boolean;
    intentToAddFlag?: boolean;
  };
  ctimeSeconds?: number;
  ctimeNanoSeconds?: number;
  mtimeSeconds?: number;
  mtimeNanoSeconds?: number;
  dev?: number;
  ino?: number;
  uid?: number;
  gid?: number;
  fileSize?: number;
}

export class GitIndex {
  files: IndexEntry[] = [];
}
