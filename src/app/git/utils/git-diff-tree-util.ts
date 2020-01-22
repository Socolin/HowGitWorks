import {GitFileType, GitHash, ZeroGitHash} from '../objects/types';
import {GitTreeChild, GitTreeObject} from '../objects/git-tree-object';
import {Repository} from '../repository';
import {GitTreeUtil} from './git-tree-util';

export interface TreeDiffResult {
  name: string;
  type: 'A' | 'D' | 'M' | 'T';
  previousMode: {
    type: GitFileType,
    perm: 0o0644 | 0o0755 | 0o0000;
  };
  previousHash: GitHash;
  newMode: {
    type: GitFileType,
    perm: 0o0644 | 0o0755 | 0o0000;
  };
  newHash: GitHash;
}

export class GitDiffTreeUtil {
  constructor(
    private readonly gitTreeUtil: GitTreeUtil
  ) {
  }

  public recursiveDiffTree(repository: Repository, tree1: GitTreeObject, tree2: GitTreeObject): TreeDiffResult[] {
    const children1 = this.gitTreeUtil.getAllChildrenRecursively(repository, tree1);
    const children2 = this.gitTreeUtil.getAllChildrenRecursively(repository, tree2);

    return this.diffTreeChildren(children1, children2);
  }

  public diffTreeObjects(tree1: GitTreeObject, tree2: GitTreeObject): TreeDiffResult[] {
    return this.diffTreeChildren(tree1.children, tree2.children);
  }

  private diffTreeChildren(children1: GitTreeChild[], children2: GitTreeChild[]): TreeDiffResult[] {
    const result: TreeDiffResult[] = [];
    const children1AsDictionary = children1.reduce((dictionary, tree) => {
      dictionary[tree.path] = tree;
      return dictionary;
    }, {} as { [path: string]: GitTreeChild });
    const children2AsDictionary = children2.reduce((dictionary, tree) => {
      dictionary[tree.path] = tree;
      return dictionary;
    }, {} as { [path: string]: GitTreeChild });

    const allPaths = Array.from(new Set(Object.keys(children1AsDictionary).concat(Object.keys(children2AsDictionary)))).sort();
    for (const path of allPaths.sort()) {
      const previousChild = children1AsDictionary[path];
      const newChild = children2AsDictionary[path];
      if (previousChild && newChild) {
        if (previousChild.mode.type !== newChild.mode.type) {
          if (previousChild.mode.type === GitFileType.Directory || newChild.mode.type === GitFileType.Directory) {
            result.push({
              name: path,
              type: 'D',
              previousHash: previousChild.objectHash,
              previousMode: previousChild.mode,
              newHash: ZeroGitHash,
              newMode: {perm: 0, type: GitFileType.None},
            });
            result.push({
              name: path,
              type: 'A',
              previousHash: ZeroGitHash,
              previousMode: {perm: 0, type: GitFileType.None},
              newHash: newChild.objectHash,
              newMode: newChild.mode,
            });
          } else {
            result.push({
              name: path,
              type: 'T',
              previousHash: previousChild.objectHash,
              previousMode: previousChild.mode,
              newHash: newChild.objectHash,
              newMode: newChild.mode,
            });
          }
        }
        if (newChild.objectHash !== previousChild.objectHash) {
          result.push({
            name: path,
            type: 'M',
            previousHash: previousChild.objectHash,
            previousMode: previousChild.mode,
            newHash: newChild.objectHash,
            newMode: newChild.mode,
          });
        }
      } else if (newChild) {
        result.push({
          name: path,
          type: 'A',
          previousHash: ZeroGitHash,
          previousMode: {perm: 0, type: GitFileType.None},
          newHash: newChild.objectHash,
          newMode: newChild.mode,
        });
      } else {
        result.push({
          name: path,
          type: 'D',
          previousHash: previousChild.objectHash,
          previousMode: previousChild.mode,
          newHash: ZeroGitHash,
          newMode: {perm: 0, type: GitFileType.None},
        });
      }
    }
    return result;
  }
}
