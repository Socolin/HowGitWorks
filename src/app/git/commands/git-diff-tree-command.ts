import {ArgvParser} from '../../utils/argv-parser';
import {Terminal} from '../../utils/terminal';
import {Context} from '../../models/context';
import {FileSystemUtil} from '../../utils/file-system-util';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitTreeUtil} from '../utils/git-tree-util';
import {GitDiffTreeUtil, TreeDiffResult} from '../utils/git-diff-tree-util';
import {GitTreeObject} from '../objects/git-tree-object';
import {GitHash} from '../objects/types';
import {GitCommitObject} from '../objects/git-commit-object';
import {GitModeUtil} from '../utils/git-mode-util';

export class GitDiffTreeCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil = new GitObjectUtil(),
    private readonly gitModeUtil: GitModeUtil = new GitModeUtil(),
    private readonly gitDiffTreeUtil: GitDiffTreeUtil = new GitDiffTreeUtil(new GitTreeUtil(gitObjectUtil)),
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
      const hash1 = args.values[0];
      const hash2 = args.values[1];

      const tree1 = this.getTree(hash1);
      const tree2 = this.getTree(hash2);

      let differences: TreeDiffResult[];
      if (args.options.recursive) {
        differences = this.gitDiffTreeUtil.recursiveDiffTree(this.context.repository, tree1, tree2);
      } else {
        differences = this.gitDiffTreeUtil.diffTreeObjects(tree1, tree2);
      }

      for (const diff of differences) {
        const mode1 = this.gitModeUtil.formatMode(diff.previousMode);
        const mode2 = this.gitModeUtil.formatMode(diff.newMode);
        this.terminal.write(`:${mode1} ${mode2} ${diff.previousHash} ${diff.newHash} ${diff.type}\t${diff.name}`);
      }
    } else {
      this.terminal.writeError('NOT IMPLEMETED YET: Please provide 2 arguments');
    }
  }

  private getTree(hash: GitHash): GitTreeObject {
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
