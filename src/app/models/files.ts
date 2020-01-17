export enum FileType {
  textFile = 'textFile',
  directory = 'directory'
}

export interface IFileSystemNode {
  type: FileType;
  name: string;
}

export class Directory implements IFileSystemNode {
  readonly type = FileType.directory;
  name: string;
  parent: Directory;
  files: File[] = [];

  constructor(name: string, parent?: Directory) {
    this.name = name;
    this.parent = parent || this;
  }

  static fromSerialized(serialized: any, parent?: Directory) {
    const directory = new Directory(serialized.name, parent);
    directory.files = serialized.files.map(f => {
      switch (f.type as FileType) {
        case FileType.textFile:
          return TextFile.fromSerialized(f);
        case FileType.directory:
          return Directory.fromSerialized(f);
      }
    });
    return directory;
  }
}

export class TextFile implements IFileSystemNode {
  readonly type = FileType.textFile;
  name: string;
  content: string;

  constructor(name: string, content: string) {
    this.name = name;
    this.content = content;
  }

  static fromSerialized(serialized: any): TextFile {
    return new TextFile(serialized.name, serialized.content);
  }
}

export type File = Directory | TextFile;
