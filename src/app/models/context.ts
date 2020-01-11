import {Repository} from '../git/repository';
import {Directory} from './files';

export class Context {
  repository: Repository;
  root: Directory = new Directory('');
  workingDirectory: Directory = this.root;
}
