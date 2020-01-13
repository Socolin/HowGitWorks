import {ArgvParser} from '../../utils/argv-parser';
import {Terminal} from '../../utils/terminal';
import {Context} from '../../models/context';
import {FileSystemUtil} from '../../utils/file-system-util';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitIndexUtil} from '../utils/git-index-util';
import {Directory} from '../../models/files';
import {IndexEntry} from '../git-index';

export class GitStatusCommand {
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
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const args = this.argvParser.parse(argv);
    const allFilesPaths = this.fileSystemUtil.getAllChildPath(this.context, '/').map(x => x.substr(1));
    const allFilesPathAsDict = allFilesPaths.reduce((dic, path) => {
      dic[path] = 1;
      return dic;
    }, {});
    const indexFilesByPath = this.context.repository.index.files.reduce((dic, entry) => {
      dic[entry.path] = entry;
      return dic;
    }, {} as { [path: string]: IndexEntry });

    const addedFiles = [];
    const removedFiles = [];
    const modifiedFiles = [];

    for (const filePath of allFilesPaths) {
      if (!(filePath in indexFilesByPath)) {
        addedFiles.push(filePath);
      } else {
        const node = this.fileSystemUtil.getNode(this.context, filePath);
        if (node instanceof Directory) {
          throw new Error('Unexpected directory node found, was expecting a file');
        }
        const blob = this.gitObjectUtil.hashBlob(node.content);
        if (blob.hash !== indexFilesByPath[filePath].objectHash) {
          modifiedFiles.push(filePath);
        }
      }
    }

    for (const file of this.context.repository.index.files) {
      if (!(file.path in allFilesPathAsDict)) {
        removedFiles.push(file.path);
      }
    }

    // FIXME: On branch master
    // FIXME: Changes to be committed:

    if (modifiedFiles.length || removedFiles.length) {
      this.terminal.write('Changes not staged for commit:');
      this.terminal.write('');
      this.terminal.write('  (use "git add/rm <file>..." to update what will be committed)');
      this.terminal.write('  (use "git checkout -- <file>..." to discard changes in working directory)');
      this.terminal.write('');
      let changes = modifiedFiles.reduce((c, f) => {c[f] = 'm'; return c; } , {});
      changes = removedFiles.reduce((c, f) => {c[f] = 'd'; return c; }, changes);
      for (const path of Object.keys(changes)) {
        switch (changes[path]) {
          case 'm':
            this.terminal.write('modified:   ' + path);
            break;
          case 'd':
            this.terminal.write('deleted:    ' + path);
            break;
        }
      }
    }

    if (addedFiles.length) {
      this.terminal.write('Untracked files:');
      this.terminal.write('  (use "git add <file>..." to include in what will be committed)\n');
      this.terminal.write('');
      for (const addedFile of addedFiles) {
        this.terminal.write('        ' + addedFile);
      }
      this.terminal.write('');
    }

    return 0;
  }
}
