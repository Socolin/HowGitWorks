import {Context} from '../../models/context';
import {Terminal} from '../../utils/terminal';
import {ArgvParser} from '../../utils/argv-parser';
import {FileSystemUtil} from '../../utils/file-system-util';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitIndexUtil} from '../utils/git-index-util';
import {TextFile} from '../../models/files';

export class GitRmCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitIndexUtil: GitIndexUtil,
  ) {
    this.argvParser = new ArgvParser([
      {name: 'verbose', short: 'v', arg: false},
      {name: 'cached', short: undefined, arg: false},
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const args = this.argvParser.parse(argv);

    let files = args.values;
    if (args.options.all) {
      files = this.fileSystemUtil.getAllChildPath(this.context, '/');
    }

    for (const path of files) {
      const indexEntryIndex = this.context.repository.index.files.findIndex(x => x.path === path);
      if (indexEntryIndex === -1) {
        this.terminal.writeError(`fatal: pathspec '${path}' did not match any files`);
        return 1;
      }
      this.context.repository.index.files.splice(indexEntryIndex, 1);
      if (!args.options.cached) {
        const node = this.fileSystemUtil.getNode(this.context, path);
        if (node instanceof TextFile) {
          this.fileSystemUtil.deleteFile(node);
        }
      }
    }
  }
}
