import {IGitObject} from './git-object';

export class Blob implements IGitObject {
  public readonly type = 'blob';
  public readonly size: number;
  public readonly text;
}
