import {Terminal} from '../utils/terminal';
import {Context} from '../models/context';
import {Injectable} from '@angular/core';
import {Directory} from '../models/files';

@Injectable()
export class InitExecutor {
  constructor(
    private readonly terminal: Terminal
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    context.root = new Directory('');
    context.workingDirectory = context.root;
    context.repository = undefined;
    return 0;
  }
}
