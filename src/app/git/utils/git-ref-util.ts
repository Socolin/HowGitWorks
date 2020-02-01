import {Injectable} from '@angular/core';
import {Repository} from '../repository';
import {GitHash} from '../objects/types';
import {GitBranchUtil} from './git-branch-util';

@Injectable()
export class GitRefUtil {
  constructor(
    private readonly gitBranchUtil: GitBranchUtil,
  ) {
  }

  public resolveRef(repository: Repository, refName: string): GitHash {
    if (!refName) {
      return undefined;
    }
    if (refName === 'HEAD') {
      const currentBranch = this.gitBranchUtil.getActiveBranch(repository);
      if (currentBranch) {
        return this.gitBranchUtil.getTargetHash(repository, currentBranch);
      }
      return repository.HEAD;
    }
    if (this.gitBranchUtil.branchExists(repository, refName)) {
      return this.gitBranchUtil.getTargetHash(repository, refName);
    }
    return this.resolveHash(repository, refName);
  }

  public resolveHash(repository: Repository, hashOrPartialHash: string | GitHash): GitHash | undefined {
    if (hashOrPartialHash.length === 40) {
      return hashOrPartialHash;
    }

    const matchingHashes = Object.keys(repository.objects).filter(h => h.startsWith(hashOrPartialHash));
    if (matchingHashes.length) {
      if (matchingHashes.length > 1) {
        throw new Error(`Ambiguous hash: ${hashOrPartialHash}`);
      }
      return matchingHashes[0];
    }
    return undefined;
  }
}
