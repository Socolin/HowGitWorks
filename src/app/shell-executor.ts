import {CommandParser} from './utils/command-parser';
import {Terminal} from './utils/terminal';
import {Injectable} from '@angular/core';
import {Context} from './models/context';
import {GitExecutor} from './git/git-executor';
import {MkdirExecutor} from './basic-commands/mkdir-executor';
import {EchoExecutor} from './basic-commands/echo-executor';
import {CdExecutor} from './basic-commands/cd-executor';
import {CatExecutor} from './basic-commands/cat-executor';
import {LsExecutor} from './basic-commands/ls-executor';
import {LoadExecutor} from './basic-commands/load-executor';
import {SaveExecutor} from './basic-commands/save-executor';
import {InitExecutor} from './basic-commands/init-executor';

@Injectable()
export class ShellExecutor {
  constructor(
    private readonly context: Context,
    private readonly commandParser: CommandParser,
    private readonly terminal: Terminal,
    private readonly gitExecutor: GitExecutor,
    private readonly mkdirExecutor: MkdirExecutor,
    private readonly echoExecutor: EchoExecutor,
    private readonly cdExecutor: CdExecutor,
    private readonly lsExecutor: LsExecutor,
    private readonly catExecutor: CatExecutor,
    private readonly initExecutor: InitExecutor,
    private readonly loadExecutor: LoadExecutor,
    private readonly saveExecutor: SaveExecutor,
  ) {
  }

  private readonly commandHistory: string[] = [];

  public execute(command: string): number {
    try {
      const argv = this.commandParser.parse(command);
      if (argv.length === 0) {
        return;
      }
      this.commandHistory.push(command);
      switch (argv[0]) {
        case 'git':
          return this.gitExecutor.execute(this.context, argv.slice(1));
        case 'mkdir':
          return this.mkdirExecutor.execute(this.context, argv.slice(1));
        case 'echo':
          return this.echoExecutor.execute(this.context, argv.slice(1));
        case 'cd':
          return this.cdExecutor.execute(this.context, argv.slice(1));
        case 'ls':
          return this.lsExecutor.execute(this.context, argv.slice(1));
        case 'cat':
          return this.catExecutor.execute(this.context, argv.slice(1));
        case 'init':
          return this.initExecutor.execute(this.context, argv.slice(1));
        case 'save':
          return this.saveExecutor.execute(this.context, argv.slice(1));
        case 'load':
          return this.loadExecutor.execute(this.context, argv.slice(1));
        default:
          this.terminal.writeError(`Unknown command \`${argv[0]}'`);
          return 1;
      }
      return 0;
    } catch (e) {
      console.error(e);
      this.terminal.writeError(`An error occurred: ${e.message}`);
      return 1;
    }
  }
}
