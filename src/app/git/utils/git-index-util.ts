import {Context} from '../../models/context';
import {GitFileType, GitHash} from '../objects/types';
import {IndexEntry} from '../git-index';
import {Repository} from '../repository';
import {GitBranchUtil} from './git-branch-util';
import {GitObjectUtil} from './git-object-util';
import {GitTreeUtil} from './git-tree-util';
import {GitTreeChild} from '../objects/git-tree-object';
import {Injectable} from '@angular/core';

interface IndexDiffResult {
  type: 'A' | 'D' | 'M';
  path: string;
}

@Injectable()
export class GitIndexUtil {
  constructor(
    private readonly gitBranchUtil: GitBranchUtil,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitTreeUtil: GitTreeUtil,
  ) {
  }

  addFileToIndex(context: Context, gitRelativePath: string, hash: GitHash) {
    const indexEntry: IndexEntry = {
      path: gitRelativePath,
      type: GitFileType.RegularFile,
      flags: {},
      mode: 0o644,
      objectHash: hash
    };

    const i = context.repository.index.files.findIndex(x => x.path === gitRelativePath);
    if (i !== -1) {
      context.repository.index.files[i] = indexEntry;
    } else {
      context.repository.index.files.push(indexEntry);
      context.repository.index.files.sort((a, b) => a.path.localeCompare(b.path));
    }
  }

  diffIndexWithHead(repository: Repository): IndexDiffResult[] {
    const headBranch = this.gitBranchUtil.getActiveBranch(repository);
    const headHash = headBranch ? repository.refs.heads[headBranch] : repository.HEAD;
    if (!headHash) {
      return [];
    }
    const commit = this.gitObjectUtil.getCommit(repository, headHash);
    const tree = this.gitObjectUtil.getTree(repository, commit.tree);
    const children = this.gitTreeUtil.getAllChildrenRecursively(repository, tree);

    const childrenAsDictionary = children.reduce((dictionary, treeChild) => {
      dictionary[treeChild.path] = treeChild;
      return dictionary;
    }, {} as { [path: string]: GitTreeChild });
    const indexAsDictionary = repository.index.files.reduce((dictionary, indexEntry) => {
      dictionary[indexEntry.path] = indexEntry;
      return dictionary;
    }, {} as { [path: string]: IndexEntry });
    const allPaths = Array.from(new Set(Object.keys(childrenAsDictionary).concat(Object.keys(indexAsDictionary)))).sort();

    const result: IndexDiffResult[] = [];
    for (const path of allPaths) {
      const indexEntry = indexAsDictionary[path];
      const child = childrenAsDictionary[path];
      if (indexEntry && child) {
        if (indexEntry.objectHash !== child.objectHash) {
          result.push({
            type: 'M',
            path
          });
        }
      } else if (indexEntry) {
        result.push({
          type: 'A',
          path
        });
      } else {
        result.push({
          type: 'D',
          path
        });
      }
    }
    return result;
  }
}
