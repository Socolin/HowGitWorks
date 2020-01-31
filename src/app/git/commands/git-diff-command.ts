import {Context} from '../../models/context';
import {Terminal} from '../../utils/terminal';
import {ArgvParser} from '../../utils/argv-parser';
import {FileSystemUtil} from '../../utils/file-system-util';
import {GitObjectUtil} from '../utils/git-object-util';
import {GitIndexUtil, IndexDiffResult, WorkDirectoryDiffAddResult, WorkDirectoryDiffModifiedResult} from '../utils/git-index-util';

import * as JsDiff from 'diff';
import {GitFileMode, GitFileType, GitHash, ZeroGitHash} from '../objects/types';
import {GitModeUtil} from '../utils/git-mode-util';

export class GitDiffCommand {
  private readonly argvParser: ArgvParser;

  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context,
    private readonly fileSystemUtil: FileSystemUtil,
    private readonly gitObjectUtil: GitObjectUtil,
    private readonly gitIndexUtil: GitIndexUtil,
    private readonly gitModeUtil: GitModeUtil,
  ) {
    this.argvParser = new ArgvParser([
      {name: 'cached', short: 'c', arg: false}
    ]);
  }

  execute(argv: string[]): number {
    if (!this.context.repository) {
      this.terminal.writeError('fatal: not a git repository');
      return 1;
    }

    const args = this.argvParser.parse(argv);

    if (args.options.cached) {
      const allDifferences = this.gitIndexUtil.diffIndexWithHead(this.context.repository);
      if (!args.values.length) {
        this.writeDiff(allDifferences);
      } else {
        for (const path of args.values) {
          this.writeDiff(allDifferences.filter(d => d.path === path));
        }
      }
    } else {
      const localDifferences = this.gitIndexUtil.diffWorktreeWithIndex(this.context);
      if (!args.values.length) {
        this.writeDiff(localDifferences);
      } else {
        for (const path of args.values) {
          this.writeDiff(localDifferences.filter(d => d.path === path));
        }
      }
    }
  }

  private writeDiff(differences: IndexDiffResult[]) {
    console.log(differences);
    for (const diff of differences) {
      switch (diff.type) {
        case 'A': {
          const newStr = (diff as WorkDirectoryDiffAddResult).content
            || this.gitObjectUtil.getBlob(this.context.repository, diff.new.objectHash).text;
          this.formatDiff(
            diff.path,
            '',
            newStr,
            {objectHash: ZeroGitHash, mode: {perm: 0o0000, type: GitFileType.RegularFile}},
            diff.new
          );
          break;
        }
        case 'D': {
          const oldStr = this.gitObjectUtil.getBlob(this.context.repository, diff.previous.objectHash).text;
          this.formatDiff(
            diff.path,
            oldStr,
            '',
            diff.previous,
            {objectHash: ZeroGitHash, mode: {perm: 0o0000, type: GitFileType.RegularFile}}
          );
          break;
        }
        case 'M': {
          const oldStr = this.gitObjectUtil.getBlob(this.context.repository, diff.previous.objectHash).text;
          const newStr = (diff as WorkDirectoryDiffModifiedResult).content
            || this.gitObjectUtil.getBlob(this.context.repository, diff.new.objectHash).text;
          this.formatDiff(diff.path, oldStr, newStr, diff.previous, diff.new);
          break;
        }
      }
    }
  }

  private formatDiff(
    path: string,
    oldStr: string,
    newStr: string,
    previousFile: { objectHash: GitHash, mode: GitFileMode },
    newFile: { objectHash: GitHash, mode: GitFileMode }
  ) {
    this.terminal.write(`diff --git a/${path} b/${path}`);

    const newMode = this.gitModeUtil.formatMode(newFile.mode);
    const previousMode = this.gitModeUtil.formatMode(previousFile.mode);
    if (newMode !== previousMode) {
      if (previousMode === '000000') {
        this.terminal.write(`old file mode ${previousMode}`);
      }
      if (newMode === '000000') {
        this.terminal.write(`new file mode ${newMode}`);
      }
      this.terminal.write(`index ${previousFile.objectHash.substr(0, 7)}..${newFile.objectHash.substr(0, 7)}`);
    } else {
      this.terminal.write(`index ${previousFile.objectHash.substr(0, 7)}..${newFile.objectHash.substr(0, 7)} ${newMode}`);
    }

    if (oldStr) {
      this.terminal.write(`--- a/${path}`);
    } else {
      this.terminal.write(`--- /dev/null`);
    }
    if (oldStr) {
      this.terminal.write(`+++ /dev/null`);
    } else {
      this.terminal.write(`+++ b/${path}`);
    }

    const fileDiff = JsDiff.diffLines(oldStr, newStr);
    for (const change of fileDiff) {
      let prefix = ' ';
      if (change.added) {
        prefix = '+';
      } else if (change.removed) {
        prefix = '-';
      }
      const lines = change.value.split('\n');
      lines.pop();
      for (const line of lines) {
        this.terminal.write(prefix + line);
      }
    }
  }
}
