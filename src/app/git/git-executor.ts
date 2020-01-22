import {Context} from '../models/context';
import {Terminal} from '../utils/terminal';
import {Injectable} from '@angular/core';
import {GitInitCommand} from './commands/git-init-command';
import {GitAddCommand} from './commands/git-add-command';
import {FileSystemUtil} from '../utils/file-system-util';
import {GitObjectUtil} from './utils/git-object-util';
import {GitStatusCommand} from './commands/git-status-command';
import {GitCommitCommand} from './commands/git-commit-command';
import {GitBranchCommand} from './commands/git-branch-command';
import {GitDiffTreeCommand} from './commands/git-diff-tree-command';

@Injectable()
export class GitExecutor {
  constructor(
    private readonly terminal: Terminal,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    if (argv.length === 0) {
      this.writeHelp();
      return 1;
    }
    switch (argv[0]) {
      case 'init':
        new GitInitCommand(this.terminal, context).execute(argv.slice(1));
        break;
      case 'add':
        new GitAddCommand(this.terminal, context, this.fileSystemUtil, this.gitObjectUtil).execute(argv.slice(1));
        break;
      case 'status':
        new GitStatusCommand(this.terminal, context, this.fileSystemUtil, this.gitObjectUtil).execute(argv.slice(1));
        break;
      case 'commit':
        new GitCommitCommand(this.terminal, context, this.fileSystemUtil).execute(argv.slice(1));
        break;
      case 'branch':
        new GitBranchCommand(this.terminal, context, this.fileSystemUtil).execute(argv.slice(1));
        break;
      case 'diff-tree':
        new GitDiffTreeCommand(this.terminal, context, this.fileSystemUtil).execute(argv.slice(1));
        break;
      default:
        this.terminal.writeError(`git: Unknown sub-command: \`${argv[0]}'`);
        return 1;
    }
    return 0;
  }

  private writeHelp() {
    this.terminal.write('usage: git <subcommand>');
    this.terminal.write('    init        Create an empty Git repository');
  }
}
