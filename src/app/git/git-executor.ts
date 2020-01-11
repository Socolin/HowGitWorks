import {Context} from '../models/context';
import {Terminal} from '../utils/terminal';
import {Injectable} from '@angular/core';
import {GitInitCommand} from './commands/git-init-command';

@Injectable()
export class GitExecutor {
  constructor(private readonly terminal: Terminal) {
  }

  public execute(context: Context, argv: string[]): number {
    if (argv.length === 0) {
      this.writeHelp();
      return 1;
    }
    switch (argv[0]) {
      case 'init':
        new GitInitCommand(this.terminal, context).execute(argv.slice(1));
        break;
      default:
        this.terminal.writeError(`git: Unknown sub-command: \`${argv[0]}'`);
        return 1;
    }
    return 0;
  }

  private writeHelp() {
    this.terminal.write('usage: git <subcommand>');
    this.terminal.write('    init        Create an empty Git repository');
  }
}
