export type GitHash = string;

export const ZeroGitHash = '0000000000000000000000000000000000000000' as GitHash;

export enum GitFileType {
  None = 0o0,
  RegularFile = 0o10,
  Directory = 0o40,
  Link = 0o12,
  // Reference submodule commit https://github.com/git/git/blob/042ed3e048af08014487d19196984347e3be7d1c/cache.h#L63
  GitLink = (Directory | Link)
  /**
   * These don't seem to be addable to git repository
   * https://github.com/git/git/blob/53f9a3e157dbbc901a02ac2c73346d375e24978c/compat/stat.c#L5
   * BlockDevice = 0o06,
   * CharacterDevice = 0o02,
   * Pipe = 0o01,
   * Socket = 0o14,
   */
}

export interface GitFileMode {
  readonly type: GitFileType;
  readonly perm: 0o0644 | 0o0755 | 0o0000;
}
