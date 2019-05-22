import { Command, flags } from '@oclif/command';
import { Input } from '@oclif/parser/lib/flags';
import { IArg } from '@oclif/parser/lib/args';
import * as path from 'path';
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
    const gitConfigPath = path.resolve(cwd, args.path, '.git', 'config');

    const gitConfigExists = fs.existsSync(gitConfigPath);
    if (!gitConfigExists) {
      this.error(`Path not found: ${gitConfigPath}`);
    }

    const gitConfig = parse.sync({ path: gitConfigPath });
    const origin = gitConfig['remote "origin"'];

    if (!origin) { this.error('No "origin" remote found in git config'); }
    if (!origin.url) { this.error('Couldn\'t read a "url" for the "origin" remote'); }

    const originUrl: string = origin.url;
    const repositoryUrl = originUrl.substring(0, originUrl.lastIndexOf('.git'));

    this.log(`Opening '${repositoryUrl}' in your default browser...`);

    open(repositoryUrl);
  }
}
