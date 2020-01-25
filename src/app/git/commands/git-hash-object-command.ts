import {Context} from '../../models/context';
import {Terminal} from '../../utils/terminal';
import {ArgvParser} from '../../utils/argv-parser';
import {FileSystemUtil} from '../../utils/file-system-util';
import {Directory} from '../../models/files';
import {GitObjectUtil} from '../utils/git-object-util';

export class GitHashObjectCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil,
  ) {
    this.argvParser = new ArgvParser([
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const args = this.argvParser.parse(argv);

    for (const path of args.values) {
      const file = this.fileSystemUtil.getNode(this.context, path);
      if (file instanceof Directory) {
        continue;
      }

      const object = this.gitObjectUtil.hashBlob(file.content);
      this.terminal.write(object.hash);
    }
  }
}
