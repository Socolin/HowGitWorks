import {Context} from '../../models/context';
import {GitFileMode, GitFileType, GitHash} from '../objects/types';
import {IndexEntry} from '../git-index';
import {Repository} from '../repository';
import {GitBranchUtil} from './git-branch-util';
import {GitObjectUtil} from './git-object-util';
import {GitTreeUtil} from './git-tree-util';
import {GitTreeChild} from '../objects/git-tree-object';
import {Injectable} from '@angular/core';
import {FileSystemUtil} from '../../utils/file-system-util';
import {Directory} from '../../models/files';

interface IndexDiffAddResult {
  type: 'A';
  path: string;
  new: {
    objectHash: GitHash,
    mode: GitFileMode
  };
}

interface IndexDiffDeleteResult {
  type: 'D';
  path: string;
  previous: {
    objectHash: GitHash,
    mode: GitFileMode
  };
}

interface IndexDiffModifiedResult {
  type: 'M';
  path: string;
  previous: {
    objectHash: GitHash,
    mode: GitFileMode
  };
  new: {
    objectHash: GitHash,
    mode: GitFileMode
  };
}

export type IndexDiffResult = IndexDiffAddResult | IndexDiffDeleteResult | IndexDiffModifiedResult;


export interface WorkDirectoryDiffAddResult extends IndexDiffAddResult {
  content: string;
}

export interface WorkDirectoryDiffModifiedResult extends IndexDiffModifiedResult {
  content: string;
}

export type WorkDirectoryDiffResult = WorkDirectoryDiffAddResult | IndexDiffDeleteResult | WorkDirectoryDiffModifiedResult;


@Injectable()
export class GitIndexUtil {
  constructor(
    private readonly gitBranchUtil: GitBranchUtil,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitTreeUtil: GitTreeUtil,
    private readonly fileSystemUtil: FileSystemUtil,
  ) {
  }

  addFileToIndex(context: Context, gitRelativePath: string, hash: GitHash) {
    const indexEntry: IndexEntry = {
      path: gitRelativePath,
      mode: {
        type: GitFileType.RegularFile,
        perm: 0o644
      },
      flags: {},
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

  diffWorktreeWithIndex(context: Context): WorkDirectoryDiffResult[] {
    const allFilesPaths = this.fileSystemUtil.getAllChildPath(context, '/').map(x => x.substr(1));
    const allFilesPathAsDict = allFilesPaths.reduce((dic, path) => {
      dic[path] = 1;
      return dic;
    }, {});
    const indexFilesByPath = context.repository.index.files.reduce((dic, entry) => {
      dic[entry.path] = entry;
      return dic;
    }, {} as { [path: string]: IndexEntry });

    const addedFiles = [];
    const removedFiles = [];
    const modifiedFiles = [];

    for (const filePath of allFilesPaths) {
      const node = this.fileSystemUtil.getNode(context, filePath);
      if (node instanceof Directory) {
        throw new Error('Unexpected directory node found, was expecting a file');
      }
      const blob = this.gitObjectUtil.hashBlob(node.content);
      if (!(filePath in indexFilesByPath)) {
        addedFiles.push({
          c: 'a',
          path: filePath,
          hash: blob.hash,
          content: node.content,
          indexEntry: indexFilesByPath[filePath]
        });
      } else {
        if (blob.hash !== indexFilesByPath[filePath].objectHash) {
          modifiedFiles.push({
            c: 'm',
            path: filePath,
            hash: blob.hash,
            content: node.content,
            indexEntry: indexFilesByPath[filePath]
          });
        }
      }
    }

    for (const file of context.repository.index.files) {
      if (!(file.path in allFilesPathAsDict)) {
        removedFiles.push({path: file.path, c: 'd'});
      }
    }

    const differences: WorkDirectoryDiffResult[] = [];
    if (modifiedFiles.length || removedFiles.length) {
      const changes = modifiedFiles.concat(removedFiles).sort((a, b) => a.path.localeCompare(b));
      for (const change of changes) {
        switch (change.c) {
          case 'd': {
            differences.push({
              type: 'D',
              path: change.path,
              previous: {
                objectHash: change.indexEntry.objectHash,
                mode: change.indexEntry.mode
              }
            });
            break;
          }
          case 'm': {
            const hash = this.gitObjectUtil.hashBlob(change.content).hash;
            differences.push({
              type: 'M',
              path: change.path,
              previous: {
                objectHash: change.indexEntry.objectHash,
                mode: change.indexEntry.mode
              },
              new: {
                objectHash: hash,
                mode: {
                  perm: 0o0644,
                  type: GitFileType.RegularFile
                }
              },
              content: change.content
            });
            break;
          }
        }
      }
    }
    if (addedFiles.length) {
      for (const change of addedFiles) {
        const hash = this.gitObjectUtil.hashBlob(change.content).hash;
        differences.push({
          type: 'A',
          path: change.path,
          new: {
            objectHash: hash,
            mode: {
              perm: 0o0644,
              type: GitFileType.RegularFile
            }
          },
          content: change.content
        });
      }
    }

    return differences;
  }

  diffIndexWithHead(repository: Repository): IndexDiffResult[] {
    const headBranch = this.gitBranchUtil.getActiveBranch(repository);
    const headHash = headBranch ? repository.refs.heads[headBranch] : repository.HEAD;
    if (!headHash) {
      return repository.index.files.map((indexEntry) => ({
        path: indexEntry.path,
        type: 'A',
        new: {
          objectHash: indexEntry.objectHash,
          mode: indexEntry.mode
        }
      }));
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
            path,
            new: indexEntry,
            previous: child
          });
        }
      } else if (indexEntry) {
        result.push({
          type: 'A',
          path,
          new: indexEntry,
        });
      } else {
        result.push({
          type: 'D',
          path,
          previous: indexEntry
        });
      }
    }
    return result;
  }
}
