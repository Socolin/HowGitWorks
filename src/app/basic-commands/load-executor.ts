import {Injectable} from '@angular/core';

import {Terminal} from '../utils/terminal';
import {Context} from '../models/context';
import {ContextDeserializer} from '../utils/context-deserializer';

@Injectable()
export class LoadExecutor {
  constructor(
    private readonly terminal: Terminal,
    private readonly contextDeserializer: ContextDeserializer
  ) {
  }

  public execute(context: Context, argv: string[]): number {
    const data = localStorage.getItem('savedContext:' + argv[0]);
    if (data === null) {
      this.terminal.writeError(`Context ${argv[0]} not found`);
      return 1;
    }

    const loadedContext = this.contextDeserializer.deserialize(data);
    context.repository = loadedContext.repository;
    context.workingDirectory = loadedContext.workingDirectory;
    context.root = loadedContext.root;

    return 0;
  }
}
