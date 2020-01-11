import {Terminal} from '../utils/terminal';
import {Context} from '../models/context';
import {Injectable} from '@angular/core';
import {FileSystemUtil} from '../utils/file-system-util';

@Injectable()
export class CdExecutor {
  constructor(
    private readonly terminal: Terminal,
    private readonly fileSystemUtil: FileSystemUtil
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    const path = argv.join(' ');
    this.fileSystemUtil.changeWorkingDirectory(context, path);
    return 0;
  }
}
