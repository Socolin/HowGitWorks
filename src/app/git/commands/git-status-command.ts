import {ArgvParser} from '../../utils/argv-parser';
import {Terminal} from '../../utils/terminal';
import {Context} from '../../models/context';
import {FileSystemUtil} from '../../utils/file-system-util';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitIndexUtil} from '../utils/git-index-util';
import {GitBranchUtil} from '../utils/git-branch-util';
import {GitTreeUtil} from '../utils/git-tree-util';

export class GitStatusCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitBranchUtil: GitBranchUtil,
    private readonly gitTreeUtil: GitTreeUtil,
    private readonly gitIndexUtil: GitIndexUtil,
  ) {
    this.argvParser = new ArgvParser([
      {name: 'verbose', short: 'v', arg: false},
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const args = this.argvParser.parse(argv);

    const currentBranch = this.gitBranchUtil.getActiveBranch(this.context.repository);
    if (currentBranch) {
      this.terminal.write(`On branch ${currentBranch}`);
    } else {
      this.terminal.write(`HEAD detached at ${this.context.repository.HEAD}`);
    }

    const differences = this.gitIndexUtil.diffIndexWithHead(this.context.repository);
    if (differences.length) {
      this.terminal.write(`Changes to be committed:`);
      this.terminal.write(`  (use "git reset HEAD <file>..." to unstage)`);
      this.terminal.write('');
      for (const diff of differences) {
        switch (diff.type) {
          case 'A':
            this.terminal.write(`\tnew file:\t${diff.path}`);
            break;
          case 'D':
            this.terminal.write(`\tdeleted:\t${diff.path}`);
            break;
          case 'M':
            this.terminal.write(`\tmodified:\t${diff.path}`);
            break;
        }
      }
      this.terminal.write('');
    }

    const localDifferences = this.gitIndexUtil.diffWorktreeWithIndex(this.context);

    if (localDifferences.length) {
      if (localDifferences.filter(f => f.type !== 'A').length) {
        this.terminal.write('Changes not staged for commit:');
        this.terminal.write('');
        this.terminal.write('  (use "git add/rm <file>..." to update what will be committed)');
        this.terminal.write('  (use "git restore -- <file>..." to discard changes in working directory)');
        this.terminal.write('');
        for (const diff of localDifferences) {
          switch (diff.type) {
            case 'D':
              this.terminal.write(`\tdeleted:\t${diff.path}`);
              break;
            case 'M':
              this.terminal.write(`\tmodified:\t${diff.path}`);
              break;
          }
        }
        this.terminal.write('');
      }

      if (localDifferences.filter(f => f.type === 'A').length) {
        this.terminal.write('Untracked files:');
        this.terminal.write('  (use "git add <file>..." to include in what will be committed)\n');
        this.terminal.write('');

        for (const diff of localDifferences) {
          switch (diff.type) {
            case 'A':
              this.terminal.write(`\tnew file:\t${diff.path}`);
              break;
          }
        }
        this.terminal.write('');
      }
    }

    return 0;
  }
}
