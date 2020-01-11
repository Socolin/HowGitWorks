import {Terminal} from '../utils/terminal';
import {Context} from '../models/context';
import {Injectable} from '@angular/core';
import {FileSystemUtil} from '../utils/file-system-util';

@Injectable()
export class MkdirExecutor {
  constructor(
    private readonly terminal: Terminal,
    private readonly fileSystemUtil: FileSystemUtil
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    if (argv.length === 0) {
      this.terminal.writeError('mkdir: Missing argument');
      return 1;
    }

    for (const directoryPath of argv) {
      this.fileSystemUtil.mkDir(context, directoryPath);
    }
    return 0;
  }
}
