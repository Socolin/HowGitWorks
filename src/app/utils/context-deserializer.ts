import {Context} from '../models/context';
import {Injectable} from '@angular/core';
import {FileSystemUtil} from './file-system-util';
import {Directory} from '../models/files';
import {Repository} from '../git/repository';


@Injectable()
export class ContextDeserializer {
  constructor(
    private readonly fileSystemUtil: FileSystemUtil
  ) {
  }

  deserialize(contextJson: string): Context {
    const context = new Context();
    const serializedContext = JSON.parse(contextJson);
    context.repository = Repository.fromSerialized(serializedContext.repository);
    context.root = Directory.fromSerialized(serializedContext.root);
    context.workingDirectory = this.fileSystemUtil.getNode(context, serializedContext.workingDirectory) as Directory;
    return context;
  }
}
