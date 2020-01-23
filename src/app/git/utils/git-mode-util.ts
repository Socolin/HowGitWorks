import {GitFileType} from '../objects/types';

export class GitModeUtil {
  formatMode(mode: { type: GitFileType; perm: 0o0644 | 0o0755 | 0o0000 }) {
    return mode.type.toString(8).padStart(2, '0') + mode.perm.toString(8).padStart(4, '0');
  }
}
