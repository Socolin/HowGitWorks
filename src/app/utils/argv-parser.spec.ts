import {ArgvParser} from './argv-parser';

describe('ArgvParser', () => {
  it('should parse options prefixed with -', () => {
    const argvParser = new ArgvParser([
      {
        name: 'add', short: 'a', arg: false
      }
    ]);

    const result = argvParser.parse(['-a']);
    expect(result).toEqual({values: [], options: {add: true}});
  });

  it('should parse options prefixed with - with argument', () => {
    const argvParser = new ArgvParser([
      {
        name: 'add', short: 'a', arg: true
      }
    ]);

    const result = argvParser.parse(['-a', 'test']);
    expect(result).toEqual({values: [], options: {add: 'test'}});
  });

  it('should throw when missing argument of option that need it', () => {
    const argvParser = new ArgvParser([
      {
        name: 'add', short: 'a', arg: true
      }
    ]);

    expect(() => argvParser.parse(['-a'])).toThrow();
  });

  it('should return argv not prefixed by - as values', () => {
    const argvParser = new ArgvParser([
      {
        name: 'add', short: 'a', arg: true
      }
    ]);

    const result = argvParser.parse(['a']);
    expect(result).toEqual({values: ['a'], options: {}});
  });

  it('should parse options prefixed with --', () => {
    const argvParser = new ArgvParser([
      {
        name: 'add', short: 'a', arg: false
      }
    ]);

    const result = argvParser.parse(['--add']);
    expect(result).toEqual({values: [], options: {add: true}});
  });
});
