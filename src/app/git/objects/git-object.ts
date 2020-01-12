export type GitObjectType = 'blob' | 'commit' | 'tree';

export interface IGitObject {
  type: GitObjectType;
}
