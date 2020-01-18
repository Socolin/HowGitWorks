import {Repository} from '../repository';

export class GitBranchUtil {
  private static readonly branchRegex = /ref: refs\/heads\/(?<branch>[a-z0-9_-]+)/;

  public getActiveBranch(repository: Repository): string | undefined {
    if (!repository.HEAD) {
      return undefined;
    }
    const matchResult = GitBranchUtil.branchRegex.exec(repository.HEAD);
    if (matchResult && matchResult.groups) {
      return matchResult.groups.branch;
    }
    return undefined;
  }
}
