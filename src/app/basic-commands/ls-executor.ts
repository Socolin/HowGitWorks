import {Terminal} from '../utils/terminal';
import {Context} from '../models/context';
import {Injectable} from '@angular/core';
import {FileSystemUtil} from '../utils/file-system-util';
import {Directory} from '../models/files';

@Injectable()
export class LsExecutor {
  constructor(
    private readonly terminal: Terminal,
    private readonly fileSystemUtil: FileSystemUtil
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    const path = argv.join(' ');
    const directory = this.fileSystemUtil.getNode(context, path);
    if (!(directory instanceof Directory)) {
      this.terminal.write(directory.name);
      return 0;
    }

    for (const file of directory.files) {
      if (file instanceof Directory) {
        this.terminal.write(file.name + '/');
      } else {
        this.terminal.write(file.name);
      }
    }
    return 0;
  }
}
