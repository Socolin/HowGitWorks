import {Context} from '../../models/context';
import {GitFileType, GitHash} from '../objects/types';
import {IndexEntry} from '../git-index';

export class GitIndexUtil {
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
}
