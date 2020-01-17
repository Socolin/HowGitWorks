import {Terminal} from '../utils/terminal';
import {Context} from '../models/context';
import {Injectable} from '@angular/core';
import {ContextSerializer} from '../utils/context-serializer';

@Injectable()
export class SaveExecutor {
  constructor(
    private readonly terminal: Terminal,
    private readonly contextSerializer: ContextSerializer
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    const serializedContext = this.contextSerializer.serialize(context);
    localStorage.setItem('savedContext:' + argv[0], serializedContext);
    localStorage.setItem('lastContext', argv[0]);
    this.terminal.write('Context saved');
    return 0;
  }
}
