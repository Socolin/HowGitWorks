import {ArgvParser} from '../../utils/argv-parser';
import {Terminal} from '../../utils/terminal';
import {Context} from '../../models/context';
import {FileSystemUtil} from '../../utils/file-system-util';
import {GitBranchUtil} from '../utils/git-branch-util';

export class GitBranchCommand {

  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitBranchUtil: GitBranchUtil,
  ) {
    this.argvParser = new ArgvParser([
      {name: 'verbose', short: 'v', arg: false},
      {name: 'delete', short: 'd', arg: false},
      {name: 'force-delete', short: 'D', arg: false},
      {name: 'move', short: 'm', arg: false},
      {name: 'force-move', short: 'M', arg: false},
      {name: 'copy', short: 'c', arg: false},
      {name: 'force-copy', short: 'C', arg: false},
      {name: 'force', short: 'f', arg: false},
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const args = this.argvParser.parse(argv);
    const activeBranch = this.gitBranchUtil.getActiveBranch(this.context.repository);

    if (args.values.length === 0) {
      const branches = this.gitBranchUtil.getLocalBranches(this.context.repository);
      for (const branch of branches.sort()) {
        if (branch === activeBranch) {
          this.terminal.write('*' + branch);
        } else {
          this.terminal.write(' ' + branch);
        }
      }
      return 0;
    }

    if (args.options.copy || args.options['force-copy']) {
      const force = args.options.force || args.options['force-copy'];
      if (args.values.length > 2) {
        this.terminal.writeError('fatal: too many branches for a copy operation');
        return 1;
      }
      if (args.values.length === 2) {
        const previousBranchName = args.values[0];
        const newBranchName = args.values[1];
        if (!force && this.gitBranchUtil.branchExists(this.context.repository, newBranchName)) {
          this.terminal.writeError(`fatal: A branch named '${newBranchName}' already exists.`);
          return 1;
        }
        if (!this.gitBranchUtil.branchExists(this.context.repository, previousBranchName)) {
          this.terminal.writeError(`error: refname refs/heads/${previousBranchName} not found`);
          this.terminal.writeError('fatal: Branch copy failed');
          return 1;
        }
        this.gitBranchUtil.copyBranch(this.context.repository, previousBranchName, newBranchName);
      }
    } else if (args.options.move || args.options['force-move']) {
      const force = args.options.force || args.options['force-move'];
      if (args.values.length > 2) {
        this.terminal.writeError('fatal: too many arguments for a rename operation');
        return 1;
      }
      if (args.values.length === 2) {
        const previousBranchName = args.values[0];
        const newBranchName = args.values[1];
        if (!force && this.gitBranchUtil.branchExists(this.context.repository, newBranchName)) {
          this.terminal.writeError(`fatal: A branch named '${newBranchName}' already exists.`);
          return 1;
        }
        if (!this.gitBranchUtil.branchExists(this.context.repository, previousBranchName)) {
          this.terminal.writeError(`error: refname refs/heads/${previousBranchName} not found`);
          this.terminal.writeError('fatal: Branch rename failed');
          return 1;
        }
        this.gitBranchUtil.renameBranch(this.context.repository, previousBranchName, newBranchName);
      }

    } else if (args.options.delete || args.options['force-delete']) {
      // FIXME: force is not handle, branch not merged, should not be able to be delete
      for (const branchName of args.values) {
        if (activeBranch === branchName) {
          this.terminal.writeError(`error: Cannot delete branch '${branchName}' checked out`);
        } else {
          const targetCommit = this.gitBranchUtil.getTargetHash(this.context.repository, branchName);
          if (!targetCommit) {
            this.terminal.writeError(`error: branch '${branchName}' not found.`);
          } else {
            this.gitBranchUtil.deleteBranch(this.context.repository, branchName);
            this.terminal.write(`Deleted branch ${branchName} (was ${targetCommit.substr(0, 7)}).`);
          }
        }
      }
      return 0;
    } else {
      for (const branchName of args.values) {
        if (this.gitBranchUtil.branchExists(this.context.repository, branchName)) {
          if (!args.options.force) {
            this.terminal.writeError(`fatal: A branch named '${branchName}' already exists.`);
            return 1;
          }
        }
        this.gitBranchUtil.createBranchAtHead(this.context.repository, branchName);
      }
      return 0;
    }
  }
}
