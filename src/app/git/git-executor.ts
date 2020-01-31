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
import {GitHashFormatter} from '../utils/git-hash-formatter';
import {GitModeUtil} from './utils/git-mode-util';
import {GitDiffTreeUtil} from './utils/git-diff-tree-util';
import {GitBranchUtil} from './utils/git-branch-util';
import {GitTreeUtil} from './utils/git-tree-util';
import {GitIndexUtil} from './utils/git-index-util';
import {GitHashObjectCommand} from './commands/git-hash-object-command';
import {GitDiffCommand} from './commands/git-diff-command';
import {GitRmCommand} from './commands/git-rm-command';

@Injectable()
export class GitExecutor {
  constructor(
    private readonly terminal: Terminal,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitHashFormatter: GitHashFormatter,
    private readonly gitModeUtil: GitModeUtil,
    private readonly gitTreeUtil: GitTreeUtil,
    private readonly gitBranchUtil: GitBranchUtil,
    private readonly gitIndexUtil: GitIndexUtil,
    private readonly gitDiffTreeUtil: GitDiffTreeUtil,
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    if (argv.length === 0) {
      this.writeHelp();
      return 1;
    }
    switch (argv[0]) {
      case 'init':
        new GitInitCommand(
          this.terminal,
          context
        ).execute(argv.slice(1));
        break;
      case 'add':
        new GitAddCommand(
          this.terminal,
          context,
          this.fileSystemUtil,
          this.gitObjectUtil,
          this.gitIndexUtil
        ).execute(argv.slice(1));
        break;
      case 'rm':
        new GitRmCommand(
          this.terminal,
          context,
          this.fileSystemUtil,
          this.gitObjectUtil,
          this.gitIndexUtil
        ).execute(argv.slice(1));
        break;
      case 'hash-object':
        new GitHashObjectCommand(
          this.terminal,
          context,
          this.fileSystemUtil,
          this.gitObjectUtil
        ).execute(argv.slice(1));
        break;
      case 'diff':
        new GitDiffCommand(
          this.terminal,
          context,
          this.fileSystemUtil,
          this.gitObjectUtil,
          this.gitIndexUtil,
          this.gitModeUtil
        ).execute(argv.slice(1));
        break;
      case 'status':
        new GitStatusCommand(
          this.terminal, context,
          this.fileSystemUtil,
          this.gitObjectUtil,
          this.gitBranchUtil,
          this.gitTreeUtil,
          this.gitIndexUtil
        ).execute(argv.slice(1));
        break;
      case 'commit':
        new GitCommitCommand(
          this.terminal,
          context,
          this.fileSystemUtil,
          this.gitBranchUtil,
          this.gitObjectUtil,
          this.gitTreeUtil
        ).execute(argv.slice(1));
        break;
      case 'branch':
        new GitBranchCommand(
          this.terminal,
          context,
          this.fileSystemUtil,
          this.gitBranchUtil
        ).execute(argv.slice(1));
        break;
      case 'diff-tree':
        new GitDiffTreeCommand(
          this.terminal,
          context,
          this.fileSystemUtil,
          this.gitHashFormatter,
          this.gitObjectUtil,
          this.gitModeUtil,
          this.gitDiffTreeUtil
        ).execute(argv.slice(1));
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
