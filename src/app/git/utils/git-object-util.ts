import {GitBlobObject} from '../objects/git-blob-object';
import {Injectable} from '@angular/core';
import * as sha1 from 'js-sha1';

@Injectable()
export class GitObjectUtil {
  constructor() {
  }

  public hashBlob(content: string): GitBlobObject {
    const size = content.length;
    const hash = sha1('blob ' + size + '\0' + content);
    // FIXME: utf8, only work for ascii
    return new GitBlobObject(hash, content, size);
  }
}
