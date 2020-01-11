import {Injectable} from '@angular/core';

@Injectable()
export class CommandParser {
  parse(command: string): string[] {
    const argv: string[] = [];
    let currentArg = '';
    let previousChar = '';

    for (let i = 0; i < command.length; i++) {
      const c = command.charAt(i);
      switch (c) {
        case '"':
          if (previousChar === '\\') {
            currentArg += c;
          } else {
            const quoted = this.readUntil(command, i, '"');
            i += quoted.length + 2;
            currentArg += quoted;
          }
          break;
        case ' ':
          argv.push(currentArg);
          currentArg = '';
          break;
        default:
          currentArg += c;
          break;
      }
      previousChar = c;
    }
    if (currentArg) {
      argv.push(currentArg);
    }
    return argv;
  }

  private readUntil(command: string, pos: number, expectedChar: string): string {
    let output = '';
    let previousChar = '';
    pos++;
    while (true) {
      if (pos >= command.length) {
        throw new Error('Invalid command. Missing closing character: ' + expectedChar);
      }
      const c = command.charAt(pos);

      if (previousChar === '\\') {
        output += c;
        previousChar = '';
      } else if (c === expectedChar) {
        break;
      } else if (c === '\\') {
        previousChar = c;
      } else {
        output += c;
        previousChar = c;
      }

      pos++;
    }
    return output;
  }
}
