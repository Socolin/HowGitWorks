import {Context} from '../../models/context';
import {Terminal} from '../../utils/terminal';
import {ArgvParser} from '../../utils/argv-parser';
import {FileSystemUtil} from '../../utils/file-system-util';
import {Directory} from '../../models/files';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitIndexUtil} from '../utils/git-index-util';

export class GitAddCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitIndexUtil: GitIndexUtil = new GitIndexUtil(),
  ) {
    this.argvParser = new ArgvParser([
      {name: 'verbose', short: 'v', arg: false},
      {name: 'all', short: 'A', arg: false},
    ]);
  }

  execute(argv: string[]) {
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
      const file = this.fileSystemUtil.getNode(this.context, path);
      if (file instanceof Directory) {
        continue;
      }

      const object = this.gitObjectUtil.hashBlob(file.content);
      if (!(object.hash in this.context.repository.objects)) {
        this.context.repository.objects[object.hash] = object;
        const absolutePath = this.fileSystemUtil.getAbsolutePath(this.context, path);
        const gitRelativePath = absolutePath.substr(1);
        this.gitIndexUtil.addFileToIndex(this.context, gitRelativePath, object.hash);

        if (args.options.verbose) {
          this.terminal.write('add \'' + path + '\'');
        }
      }
    }
  }
}
