import {Terminal} from '../utils/terminal';
import {Context} from '../models/context';
import {Injectable} from '@angular/core';
import {FileSystemUtil} from '../utils/file-system-util';

@Injectable()
export class EchoExecutor {
  constructor(
    private readonly terminal: Terminal,
    private readonly fileSystemUtil: FileSystemUtil
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    let str = argv.join(' ');
    const redirectIndex = str.indexOf('>');
    if (redirectIndex !== -1) {
      const redirectTarget = str.substr(redirectIndex + 1).trim();
      str = str.substr(0, redirectIndex).trim();
      this.fileSystemUtil.writeFile(context, redirectTarget, str + '\n');
    } else {
      this.terminal.write(str);
    }
    return 0;
  }
}
