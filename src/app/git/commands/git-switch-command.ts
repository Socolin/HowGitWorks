import {Context} from '../../models/context';
import {Terminal} from '../../utils/terminal';
import {ArgvParser} from '../../utils/argv-parser';
import {FileSystemUtil} from '../../utils/file-system-util';
import {Directory} from '../../models/files';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitIndexUtil} from '../utils/git-index-util';
import {GitRefUtil} from '../utils/git-ref-util';

export class GitSwitchCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitRefUtil: GitRefUtil,
  ) {
    this.argvParser = new ArgvParser([
      {name: 'verbose', short: 'v', arg: false},
      {name: 'detach', short: undefined, arg: false},
      {name: 'force', short: 'f', arg: false},
      {name: 'orphan', short: undefined, arg: false},
      {name: 'create', short: 'c', arg: false},
      {name: 'force-create', short: 'C', arg: false},
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const args = this.argvParser.parse(argv);
    if (!args.values.length) {
      this.terminal.writeError('fatal: missing branch or commit argument');
      return 1;
    }

    if (args.options.detach) {
      this.terminal.writeError('--detach NOT IMPLEMENTED');
    } else if (args.options.create || args.options['force-create']) {
      this.terminal.writeError('--create NOT IMPLEMENTED');
    } else if (args.options.orphan) {
      this.terminal.writeError('--orphan NOT IMPLEMENTED');
    } else {
      if (args.values.length > 1) {
        this.terminal.writeError('fatal: only one reference expected');
        return 1;
      }
      const branchName = args.values[0];
      this.terminal.writeError('NOT IMPLEMENTED');
      // const ref = this.gitRefUtil.resolveRef(branchName);
    }
  }
}
