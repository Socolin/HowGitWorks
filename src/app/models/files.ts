export enum FileType {
  textFile = 'textFile',
  directory = 'directory'
}

export interface IFileSystemNode {
  type: FileType;
  name: string;
  parent: Directory;
}

export class Directory implements IFileSystemNode {
  readonly type = FileType.directory;
  name: string;
  files: File[] = [];
  parent: Directory;

  constructor(name: string, parent?: Directory) {
    this.name = name;
    this.parent = parent || this;
  }

  static fromSerialized(serialized: any, parent?: Directory) {
    const directory = new Directory(serialized.name, parent);
    directory.files = serialized.files.map(f => {
      switch (f.type as FileType) {
        case FileType.textFile:
          return TextFile.fromSerialized(f, directory);
        case FileType.directory:
          return Directory.fromSerialized(f, directory);
      }
    });
    return directory;
  }
}

export class TextFile implements IFileSystemNode {
  readonly type = FileType.textFile;
  name: string;
  content: string;
  parent: Directory;

  constructor(name: string, content: string, parent: Directory) {
    this.name = name;
    this.content = content;
    this.parent = parent;
  }

  static fromSerialized(serialized: any, parent: Directory): TextFile {
    return new TextFile(serialized.name, serialized.content, parent);
  }
}

export type File = Directory | TextFile;
