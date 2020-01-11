import {Context} from '../../models/context';
import {Terminal} from '../../utils/terminal';
import {Repository} from '../repository';

export class GitInitCommand {
  constructor(
    private readonly terminal: Terminal,
    private readonly context: Context
  ) {
  }

  execute(argv: string[]) {
    this.context.repository = new Repository();
    this.terminal.write('Initialized empty Git repository');
  }
}
