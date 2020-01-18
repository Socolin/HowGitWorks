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

  public getLocalBranches(repository: Repository): string[] {
    return Object.keys(repository.refs.heads);
  }

  public branchExists(repository: Repository, branchName: string): boolean {
    return branchName in repository.refs.heads;
  }

  public createBranchAtHead(repository: Repository, branchName: string): void {
    const currentBranch = this.getActiveBranch(repository);
    if (currentBranch) {
      repository.refs.heads[branchName] = repository.refs.heads[currentBranch];
    } else {
      repository.refs.heads[branchName] = repository.HEAD;
    }
  }

  deleteBranch(repository: Repository, branchName: string) {
    delete repository.refs.heads[branchName];
  }

  getTargetHash(repository: Repository, branchName: string) {
    return repository.refs.heads[branchName];
  }

  renameBranch(repository: Repository, previousBranchName: string, newBranchName: string) {
    const currentBranch = this.getActiveBranch(repository);
    if (currentBranch === previousBranchName) {
      repository.HEAD = 'ref: refs/head/' + newBranchName;
    }
    repository.refs.heads[newBranchName] = repository.refs.heads[previousBranchName];
    delete repository.refs.heads[previousBranchName];
  }

  copyBranch(repository: Repository, previousBranchName: string, newBranchName: string) {
    repository.refs.heads[newBranchName] = repository.refs.heads[previousBranchName];
  }
}
