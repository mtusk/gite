import { Command, flags } from '@oclif/command';
import { Input } from '@oclif/parser/lib/flags';
import { IArg } from '@oclif/parser/lib/args';
import { resolve, join } from 'path';
import * as fs from 'fs';
import * as parse from 'parse-git-config';
import { open } from '../wrappers/open';

export default class Open extends Command {
  static description =
    'Opens GitHub for the repository associated ' +
    'to a directory in the default web browser.';

  static examples = [
    '$ gite open',
  ];

  static flags: Input<any> = {
    help: flags.help({ char: 'h' }),
  };

  static args: IArg[] = [{
    name: 'path',
    required: false,
    description: 'Path to directory for which to open GitHub.',
    default: '.',
  }];

  async run() {
    const { args, flags } = this.parse(Open);
    const cwd = process.cwd();
    const results = this.climb(resolve(cwd, args.path));

    if (results.gitConfigPath === null) {
      this.error('Could not find git config. Looked in the following locations:');

      results.attempts.forEach((attempt) => {
        this.log(`  ${attempt}`);
      });

      return;
    }

    const gitConfig = parse.sync({ path: results.gitConfigPath });
    const origin = gitConfig['remote "origin"'];

    if (!origin) { this.error('No "origin" remote found in git config'); }
    if (!origin.url) { this.error('Couldn\'t read a "url" for the "origin" remote'); }

    const originUrl: string = origin.url;
    const repositoryUrl = originUrl.substring(0, originUrl.lastIndexOf('.git'));

    this.log(`Opening '${repositoryUrl}' in your default browser...`);

    open(repositoryUrl);
  }

  climb: (path: string) => ({ gitConfigPath: string | null, attempts: string[] }) = (path: string) => {
    const attempt = resolve(path, '.git', 'config');
    const gitConfigExists = fs.existsSync(attempt);

    if (gitConfigExists) {
      return {
        gitConfigPath: attempt,
        attempts: [],
      };
    }

    const parentDirectory = join(path, '..');
    const alreadyAtTheTop = parentDirectory === path;
    const canClimb = !alreadyAtTheTop && fs.existsSync(parentDirectory);

    if (canClimb) {
      const results = this.climb(parentDirectory);

      return {
        gitConfigPath: results.gitConfigPath,
        attempts: [
          attempt,
          ...results.attempts,
        ],
      };
    }

    return {
      gitConfigPath: null,
      attempts: [attempt],
    };
  }
}
