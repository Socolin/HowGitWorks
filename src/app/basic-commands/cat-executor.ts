import {Terminal} from '../utils/terminal';
import {Context} from '../models/context';
import {Injectable} from '@angular/core';
import {FileSystemUtil} from '../utils/file-system-util';
import {Directory} from '../models/files';

@Injectable()
export class CatExecutor {
  constructor(
    private readonly terminal: Terminal,
    private readonly fileSystemUtil: FileSystemUtil
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    const path = argv.join(' ');
    const node = this.fileSystemUtil.getNode(context, path);
    if (node instanceof Directory) {
      this.terminal.writeError(`cat: \`${path}': Is a directory`);
      return 0;
    }
    this.terminal.write(node.content);

    return 0;
  }
}
