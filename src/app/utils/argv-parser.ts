export class ArgvParser {
  constructor(private readonly optionsDef: { name: string, short: string, arg: boolean }[]) {
  }

  parse(argv: string[]): { options: { [name: string]: string | boolean }, values: string[] } {
    let optionDef: { name: string; short: string; arg: boolean };
    const result = {
      options: {},
      values: []
    };

    for (let i = 0; i < argv.length; i++) {
      optionDef = undefined;
      const arg = argv[i];
      if (arg.startsWith('--')) {
        const name = arg.substr(2);
        optionDef = this.optionsDef.find(x => x.name === name);
        if (!optionDef) {
          throw new Error('Unrecognized option ' + arg);
        }
      } else if (arg.startsWith('-')) {
        const name = arg.substr(1);
        optionDef = this.optionsDef.find(x => x.short === name);
        if (!optionDef) {
          throw new Error('Unrecognized option ' + arg);
        }
      } else {
        result.values.push(arg);
      }

      if (optionDef) {
        if (optionDef.arg) {
          i++;
          if (i >= argv.length) {
            throw new Error('Missing option argument to ' + arg);
          }
          result.options[optionDef.name] = argv[i];
        } else {
          result.options[optionDef.name] = true;
        }
      }
    }

    return result;
  }
}
