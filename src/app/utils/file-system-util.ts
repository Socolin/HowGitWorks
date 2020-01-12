import {Injectable} from '@angular/core';
import {Context} from '../models/context';
import {Directory, File, TextFile} from '../models/files';

@Injectable()
export class FileSystemUtil {
  changeWorkingDirectory(context: Context, path: string) {
    const file = this.getNode(context, path);
    if (file instanceof Directory) {
      context.workingDirectory = file;
    } else {
      throw new Error(`Not a directory: \`${file}'`);
    }
  }

  mkDir(context: Context, path: string) {
    const directoryName = this.getFileName(path);
    const directory = this.getParentDirectory(context, path);
    const node = directory.files.find(x => x.name === directoryName);
    if (node) {
      throw new Error('Directory or file already exists: ' + path);
    }
    directory.files.push(new Directory(directoryName, directory));
  }

  writeFile(context: Context, path: string, content: string) {
    const directory = this.getParentDirectory(context, path);
    const fileName = this.getFileName(path);
    const node = directory.files.find(x => x.name === fileName);
    if (node) {
      if (node instanceof TextFile) {
        node.content = content;
      } else {
        throw new Error('Cannot write file at this location. This path is a ' + node.type);
      }
    } else {
      directory.files.push(new TextFile(fileName, content));
    }
  }

  getNode(context: Context, path: string): File {
    if (!path) {
      return context.workingDirectory;
    }
    if (path === '/') {
      return context.root;
    }
    const parentDirectory = this.getParentDirectory(context, path);
    const fileName = this.getFileName(path);
    if (fileName === '.') {
      return parentDirectory;
    }
    if (fileName === '..') {
      return parentDirectory.parent;
    }
    const node = parentDirectory.files.find(x => x.name === fileName);
    if (!node) {
      throw new Error('File not found: ' + path);
    }
    return node;
  }

  private getParentDirectory(context: Context, path: string): Directory {
    const splitPath = path.split('/');
    let directory = path.startsWith('/') ? context.root : context.workingDirectory;
    while (splitPath.length > 1) {
      const subDirName = splitPath[0];
      if (!subDirName) {
        splitPath.shift();
        continue;
      }
      if (subDirName === '.') {
        splitPath.shift();
        continue;
      }
      if (subDirName === '..') {
        directory = directory.parent;
        splitPath.shift();
        continue;
      }
      const child = directory.files.find(x => x.name === subDirName);
      if (!child) {
        throw new Error('Directory does not exist: `' + subDirName + '\'');
      }
      if (!(child instanceof Directory)) {
        throw new Error(subDirName + ' is not a directory in path ' + path);
      }
      directory = child;
      splitPath.shift();
    }
    return directory;
  }

  getAbsolutePath(context: Context, relativePath: string): string {
    let directory = this.getParentDirectory(context, relativePath);
    let absolutePath = '';
    while (directory.parent !== directory) {
      absolutePath = directory.name + '/' + absolutePath;
      directory = directory.parent;
    }
    return '/' + absolutePath + this.getFileName(relativePath);
  }

  private getFileName(path: string) {
    const splitPath = path.split('/');
    return splitPath[splitPath.length - 1];
  }

  getAllChildPath(context: Context, path: string): string[] {
    const paths = [];
    const directory = this.getNode(context, path);
    if (directory instanceof Directory) {
      this.iterateAllChild(directory, '', (filePath, node) => {
        if (node instanceof TextFile) {
          paths.push(filePath);
        }
      });
    }
    return paths;
  }

  private iterateAllChild(directory: Directory, path: string, action: (path: string, node: File) => void) {
    for (const file of directory.files) {
      action(path + '/' + file.name, file);
      if (file instanceof Directory) {
        this.iterateAllChild(file, path + '/' + file.name, action);
      }
    }
  }
}
