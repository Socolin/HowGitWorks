import {ArgvParser} from '../../utils/argv-parser';
import {Terminal} from '../../utils/terminal';
import {Context} from '../../models/context';
import {FileSystemUtil} from '../../utils/file-system-util';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitIndexUtil} from '../utils/git-index-util';
import {GitTreeUtil} from '../utils/git-tree-util';
import {GitBranchUtil} from '../utils/git-branch-util';

export class GitCommitCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitBranchUtil: GitBranchUtil = new GitBranchUtil(),
    private readonly gitObjectUtil: GitObjectUtil = new GitObjectUtil(),
    private readonly gitTreeUtil: GitTreeUtil = new GitTreeUtil(gitObjectUtil),
    private readonly gitIndexUtil: GitIndexUtil = new GitIndexUtil(),
  ) {
    this.argvParser = new ArgvParser([
      {name: 'verbose', short: 'v', arg: false},
      {name: 'message', short: 'm', arg: true},
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const currentBranch = this.gitBranchUtil.getActiveBranch (this.context.repository);
    const currentHeadHash = currentBranch ? this.context.repository.refs.heads[currentBranch] : this.context.repository.HEAD;
    let parents = [];
    if (currentHeadHash) {
      parents = [currentHeadHash];
    }
    const args = this.argvParser.parse(argv);

    const treeHash = this.gitTreeUtil.buildTreeFromIndex(this.context.repository);
    // FIXME: git config util to read configs & throw if missing & set config (git config command ?)
    const author = `${this.context.repository.config.user.name} <${this.context.repository.config.user.email}>`;
    const committer = author;
    const timestamp = new Date().getTime() / 1000;
    const timeZoneOffsetInMinutes = new Date().getTimezoneOffset() * -1;
    const timezone = (timeZoneOffsetInMinutes < 0 ? '-' : '') +
      Math.abs(timeZoneOffsetInMinutes / 60).toString().padStart(2, '0')
      + Math.abs(timeZoneOffsetInMinutes % 60).toString().padStart(2, '0');
    const message = args.options.message as string;
    const commit = this.gitObjectUtil.hashCommit(treeHash, message, author, committer, timestamp, timezone, parents);
    this.context.repository.objects[commit.hash] = commit;

    if (currentBranch) {
      this.context.repository.refs.heads[currentBranch] = commit.hash;
    } else {
      this.context.repository.HEAD = commit.hash;
    }
  }
}
