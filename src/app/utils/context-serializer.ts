import {Context} from '../models/context';
import {Directory, File} from '../models/files';
import {Repository} from '../git/repository';
import {Injectable} from '@angular/core';

@Injectable()
export class ContextSerializer {
  constructor() {
  }

  serialize(context: Context): string {
    return JSON.stringify(this.serializeContext(context));
  }

  private serializeContext(context: Context) {
    return {
      repository: this.serializeRepository(context.repository),
      root: this.serializeDirectory(context.root),
      workingDirectory: this.serializeWorkingDirectory(context.workingDirectory)
    };
  }

  private serializeRepository(repository: Repository): any {
    return repository;
  }

  private serializeDirectory(directory: Directory) {
    return {
      ...directory,
      files: this.serializeFiles(directory.files),
      parent: undefined
    };
  }

  private serializeFiles(files: File[]) {
    return files.map(f => {
      if (f instanceof Directory) {
        return this.serializeDirectory(f);
      } else {
        return {
          ...f
        };
      }
    });
  }

  private serializeWorkingDirectory(workingDirectory: Directory): string {
    let path = '';
    let directory = workingDirectory;
    while (directory.parent !== directory) {
      path = directory.name + '/' + path;
      directory = directory.parent;
    }
    path = '/' + path;
    return path;
  }

}
