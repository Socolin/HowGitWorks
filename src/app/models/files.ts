export interface IFileSystemNode {
  type: 'textFile' | 'directory';
  name: string;
}

export class Directory implements IFileSystemNode {
  readonly type = 'directory';
  name: string;
  parent: Directory;
  files: File[] = [];

  constructor(name: string, parent?: Directory) {
    this.name = name;
    this.parent = parent || this;
  }
}

export class TextFile implements IFileSystemNode {
  readonly type = 'textFile';
  name: string;
  content: string;

  constructor(name: string, content: string) {
    this.name = name;
    this.content = content;
  }
}

export type File = Directory | TextFile;
