import {GitFileMode} from '../objects/types';

export class GitModeUtil {
  formatMode(mode: GitFileMode) {
    return mode.type.toString(8).padStart(2, '0') + mode.perm.toString(8).padStart(4, '0');
  }
}
