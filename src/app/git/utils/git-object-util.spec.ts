import {GitObjectUtil} from './git-object-util';

describe('GitObjectUtil', () => {
  let gitObjectUtil: GitObjectUtil;

  beforeEach(() => {
    gitObjectUtil = new GitObjectUtil();
  });

  it('should compute expected hash', () => {
    const blob = gitObjectUtil.hashBlob('a\n');
    expect(blob.hash).toEqual('78981922613b2afb6025042ff6bd878ac1994e85');
  });
});
