import {Context} from '../../models/context';
import {Terminal} from '../../utils/terminal';
import {ArgvParser} from '../../utils/argv-parser';
import {FileSystemUtil} from '../../utils/file-system-util';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitIndexUtil} from '../utils/git-index-util';
import {GitFileType, GitHash} from '../objects/types';
import {Repository} from '../repository';
import {GitRefUtil} from '../utils/git-ref-util';

export class GitRestoreCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitIndexUtil: GitIndexUtil,
    private readonly gitRefUtil: GitRefUtil,
  ) {
    this.argvParser = new ArgvParser([
      {name: 'worktree', short: 'W', arg: false},
      {name: 'staged', short: 'S', arg: false},
      {name: 'source', short: 's', arg: true},
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const args = this.argvParser.parse(argv);

    const files = args.values;
    if (files.length === 0) {
      this.terminal.writeError('fatal: you must specify path(s) to restore');
      return 1;
    }

    const restoreWorkTree = args.options.source || !args.options.staged;
    const restoreIndex = args.options.staged;
    const source = args.options.source || (restoreIndex ? 'HEAD' : undefined);
    const sourceHash = this.gitRefUtil.resolveRef(this.context.repository, source as string);
    for (const path of files) {
      const fileObjectHash = this.getFileContentObject(this.context.repository, path, sourceHash);
      if (!fileObjectHash) {
        this.terminal.writeError(`File not found at given version '${path}' ${sourceHash}`);
        return 1;
      }
      if (restoreIndex) {
        const indexEntry = this.context.repository.index.files.find(i => i.path === path);
        indexEntry.objectHash = fileObjectHash;
      }
      if (restoreWorkTree) {
        this.fileSystemUtil.writeFile(this.context, path, this.gitObjectUtil.getBlob(this.context.repository, fileObjectHash).text);
      }
    }
  }

  private getFileContentObject(repository: Repository, path: string, sourceHash?: GitHash): GitHash | undefined {
    if (!sourceHash) {
      const indexEntry = repository.index.files.find(i => i.path === path);
      if (!indexEntry) {
        return undefined;
      }
      return indexEntry.objectHash;
    }

    const commit = this.gitObjectUtil.getCommit(repository, sourceHash);
    let tree = this.gitObjectUtil.getTree(repository, commit.tree);
    const splitPath = path.split('/');
    const fileName = splitPath.pop();
    for (const p of splitPath) {
      const child = tree.children.find(c => c.path === p);
      if (!child) {
        throw new Error(`Cannot find '${path}' in commit ${sourceHash}`);
      }
      tree = this.gitObjectUtil.getTree(repository, child.objectHash);
    }
    const fileEntry = tree.children.find(c => c.path === fileName);
    if (!fileEntry) {
      throw new Error(`Cannot find '${path}' in commit ${sourceHash}`);
    }
    if (fileEntry.mode.type === GitFileType.Directory) {
      throw new Error(`Path '${path}' is a directory`);
    }
    return fileEntry.objectHash;
  }
}
