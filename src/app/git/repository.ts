import {GitIndex} from './git-index';
import {GitObjectType, IGitObject} from './objects/git-object';
import {GitHash} from './objects/types';
import {GitCommitObject} from './objects/git-commit-object';
import {GitTreeObject} from './objects/git-tree-object';
import {GitBlobObject} from './objects/git-blob-object';

const defaultBranchName = 'master';

export class Repository {

  index: GitIndex;
  objects: { [hash: string]: IGitObject };
  refs: {
    heads: { [name: string]: GitHash };
    tags: { [name: string]: GitHash };
  };
  HEAD: GitHash | string = 'ref: refs/heads/master';
  config: {
    [sectionName: string]: {
      [key: string]: string
    }
  };

  constructor() {
    this.index = new GitIndex();
    this.refs = {
      heads: {},
      tags: {}
    };
    this.objects = {};
    this.config = {
      user: {
        name: 'John Doe',
        email: 'j@d.com'
      }
    };
  }

  static fromSerialized(serialized: any): Repository {
    const repository = new Repository();
    Object.assign(repository.refs, serialized.refs);
    Object.assign(repository.config, serialized.config);
    repository.objects = Object.entries(serialized.objects).map(([hash, o]: [string, IGitObject]) => {
      switch (o.type as GitObjectType) {
        case 'blob':
          return [hash, GitBlobObject.fromSerialized(o)];
        case 'tree':
          return [hash, GitTreeObject.fromSerialized(o)];
        case 'commit':
          return [hash, GitCommitObject.fromSerialized(o)];
      }
    }).reduce((all, objectAndHash) => {
      const [hash, object] = objectAndHash;
      all[hash as string] = object;
      return all;
    }, {});
    repository.index.files = serialized.index.files;
    return repository;
  }
}
