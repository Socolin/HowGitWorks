import {IndexEntry} from '../git-index';
import {GitFileType, GitHash} from '../objects/types';
import {GitTreeChild, GitTreeObject} from '../objects/git-tree-object';
import {Repository} from '../repository';
import {GitObjectUtil} from './git-object-util';

class IndexNode {
  [relPath: string]: IndexNode | IndexEntry;
}

export class GitTreeUtil {
  constructor(private readonly gitObjectUtil: GitObjectUtil) {
  }

  getAllChildrenRecursively(repository: Repository, tree: GitTreeObject, path: string = ''): GitTreeChild[] {
    const result: GitTreeChild[] = [];

    for (const child of tree.children) {
      if (child.mode.type === GitFileType.Directory) {
        const subTree = this.gitObjectUtil.getTree(repository, child.objectHash);
        for (const gitTreeChild of this.getAllChildrenRecursively(repository, subTree, path + child.path + '/')) {
          result.push(gitTreeChild);
        }
      } else {
        result.push({...child, path: path + child.path});
      }
    }

    return result;
  }

  buildTreeFromIndex(repository: Repository): GitHash {
    const indexAsTree: IndexNode = {};
    for (const file of repository.index.files) {
      this.putFileInTree(file, indexAsTree);
    }
    return this.buildTree(repository, indexAsTree).hash;
  }

  private buildTree(repository: Repository, indexAsTree: IndexNode): GitTreeObject {
    const children: GitTreeChild[] = [];
    for (const relativePath of Object.keys(indexAsTree).sort()) {
      const node = indexAsTree[relativePath];
      if (node instanceof IndexNode) {
        const child = this.buildTree(repository, node);
        children.push({
          mode: {
            type: GitFileType.Directory,
            perm: 0,
          },
          objectHash: child.hash,
          path: relativePath
        });
      } else {
        children.push({
          mode: {
            type: node.type,
            perm: node.mode,
          },
          objectHash: node.objectHash,
          path: relativePath
        });
      }
    }
    const tree = this.gitObjectUtil.hashTree(children);
    this.gitObjectUtil.storeObject(repository, tree);
    return tree;
  }

  private putFileInTree(file: IndexEntry, indexAsTree: IndexNode) {
    const splitPath = file.path.split('/');
    let currentNode: IndexNode = indexAsTree;
    for (let i = 0; i < splitPath.length; i++) {
      const pathFragment = splitPath[i];
      if (i === splitPath.length - 1) {
        currentNode[pathFragment] = file;
      } else {
        if (pathFragment in currentNode) {
          const node = currentNode[pathFragment];
          if (node instanceof IndexNode) {
            currentNode = node;
          } else {
            throw new Error('Error while building tree, index seems to use same path as a file and as a directory');
          }
        } else {
          const newNode = new IndexNode();
          currentNode[pathFragment] = newNode;
          currentNode = newNode;
        }
      }
    }
  }
}
