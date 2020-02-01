import {ArgvParser} from '../../utils/argv-parser';
import {Terminal} from '../../utils/terminal';
import {Context} from '../../models/context';
import {FileSystemUtil} from '../../utils/file-system-util';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitDiffTreeUtil, TreeDiffResult} from '../utils/git-diff-tree-util';
import {GitTreeObject} from '../objects/git-tree-object';
import {GitCommitObject} from '../objects/git-commit-object';
import {GitModeUtil} from '../utils/git-mode-util';
import {GitHashFormatter} from '../../utils/git-hash-formatter';
import {GitRefUtil} from '../utils/git-ref-util';

export class GitDiffTreeCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitHashFormatter: GitHashFormatter,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitModeUtil: GitModeUtil,
    private readonly gitDiffTreeUtil: GitDiffTreeUtil,
    private readonly gitRefUtil: GitRefUtil,
  ) {
    this.argvParser = new ArgvParser([
      {name: 'recursive', short: 'r', arg: false},
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const args = this.argvParser.parse(argv);
    if (args.values.length === 2) {
      const tree1 = this.getTree(args.values[0]);
      const tree2 = this.getTree(args.values[1]);

      let differences: TreeDiffResult[];
      if (args.options.recursive) {
        differences = this.gitDiffTreeUtil.recursiveDiffTree(this.context.repository, tree1, tree2);
      } else {
        differences = this.gitDiffTreeUtil.diffTreeObjects(tree1, tree2);
      }

      for (const diff of differences) {
        const mode1 = this.gitModeUtil.formatMode(diff.previousMode);
        const mode2 = this.gitModeUtil.formatMode(diff.newMode);
        // tslint:disable-next-line:max-line-length
        this.terminal.write(`:${mode1} ${mode2} ${this.gitHashFormatter.format(diff.previousHash)} ${this.gitHashFormatter.format(diff.newHash)} ${diff.type}\t${diff.name}`);
      }
    } else {
      this.terminal.writeError('NOT IMPLEMETED YET: Please provide 2 arguments');
    }
  }

  private getTree(ref: string): GitTreeObject {
    const hash = this.gitRefUtil.resolveRef(this.context.repository, ref);
    const object = this.gitObjectUtil.getObject(this.context.repository, hash);
    if (object instanceof GitTreeObject) {
      return object;
    }
    if (object instanceof GitCommitObject) {
      return this.gitObjectUtil.getTree(this.context.repository, object.tree);
    }
    throw new Error('fatal: unable to read tree ' + hash);
  }
}
