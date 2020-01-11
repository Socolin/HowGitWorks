import {CommandParser} from './command-parser';

describe('CommandParser', () => {
  let parser: CommandParser;

  beforeEach(() => {
    parser = new CommandParser();
  });

  it('should split command line on space', () => {
    const argv = parser.parse('some command with args');
    expect(argv).toEqual(['some', 'command', 'with', 'args']);
  });

  it('should not split double quote delimited commands', () => {
    const argv = parser.parse('some "quoted args"');
    expect(argv).toEqual(['some', 'quoted args']);
  });

  it('should allow escaped double quote', () => {
    const argv = parser.parse('some "quoted \\" args"');
    expect(argv).toEqual(['some', 'quoted " args']);
  });

});
