import {GitBlobObject} from '../objects/git-blob-object';
import {Injectable} from '@angular/core';
import * as sha1 from 'js-sha1';
import {GitTreeChild, GitTreeObject} from '../objects/git-tree-object';
import {GitHash} from '../objects/types';
import {GitCommitObject} from '../objects/git-commit-object';

@Injectable()
export class GitObjectUtil {
  constructor() {
  }

  public hashBlob(content: string): GitBlobObject {
    const fileContent = new TextEncoder().encode(content);

    const header = new TextEncoder().encode('blob ' + fileContent.length + '\0');
    const objectContent = new Uint8Array(header.length + fileContent.length);
    objectContent.set(header);
    objectContent.set(fileContent, header.length);

    const hash = sha1(objectContent);
    return new GitBlobObject(hash, content, fileContent.length);
  }

  public hashCommit(
    treeHash: GitHash,
    message: string,
    author: string,
    committer: string,
    timestamp: number,
    timezone: string,
    parents?: GitHash[]
  ): GitCommitObject {

    let commitContent = '';
    commitContent += `tree ${treeHash}\n`;
    if (parents) {
      for (const parent of parents) {
        commitContent += `parent ${parent}\n`;
      }
    }
    commitContent += `author ${author} ${timestamp} ${timezone}\n`;
    commitContent += `committer ${committer} ${timestamp} ${timezone}\n`;
    commitContent += '\n' + message + '\n';
    const content = new TextEncoder().encode(commitContent);
    const header = new TextEncoder().encode('commit ' + content.length + '\0');
    const fullCommitContent = new Uint8Array(header.length + content.length);
    fullCommitContent.set(header);
    fullCommitContent.set(content, header.length);

    const hash = sha1(fullCommitContent);
    return new GitCommitObject(hash, message, author, committer, timestamp, timezone, parents);
  }

  public hashTree(children: GitTreeChild[]): GitTreeObject {
    const allChildrenAsArray = [];
    let totalSize = 0;
    for (const child of children) {
      const childArray = this.buildTreeChildEntry(child);
      allChildrenAsArray.push(childArray);
      totalSize += childArray.length;
    }

    const header = new TextEncoder().encode('tree ' + totalSize + '\0');
    let offset = header.length;
    const fileContent = new Uint8Array(totalSize + header.length);
    fileContent.set(header);
    for (const childArray of allChildrenAsArray) {
      fileContent.set(childArray, offset);
      offset += childArray.length;
    }

    const hash = sha1(fileContent);
    return new GitTreeObject(hash, children);
  }

  private buildTreeChildEntry(child: GitTreeChild): Uint8Array {
    const mode = child.mode.type.toString(8) + child.mode.perm.toString(8).padStart(4, '0');
    const part1 = new TextEncoder().encode(mode + ' ' + child.path + '\0');
    const result = new Uint8Array(part1.length + 20);

    result.set(part1);
    for (let i = 0; i < 20; i++) {
      result[part1.length + i] = parseInt(child.objectHash.substr(i * 2, 2), 16);
    }
    return result;
  }
}
