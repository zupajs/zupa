import { logger } from '../log';
import { dirname, resolve } from 'path';
import fs from 'fs';
import execa from 'execa';

const GITIGNORE = '.gitignore'
const IGNORED_FILES = [
	'package.json',
	'package-lock.json',
]

export class GitIgnoreManager {

	private readonly pluginDir: string;
	private readonly gitIgnorePath: string;


	constructor(private pluginPath: string) {
		this.pluginDir = dirname(this.pluginPath)
		this.gitIgnorePath = resolve(this.pluginDir, GITIGNORE)
	}

	async isGitRepo() {
		try {
			await execa('git', ['status'], {
				cwd: this.pluginDir
			});

			return true;
		}
		catch (error) {
			return false;
		}
	}

	async updateGitIgnore() {

		if (!(await this.isGitRepo())) {
			return;
		}


		logger.info(`Update ${this.gitIgnorePath}`)

		if (!fs.existsSync(this.gitIgnorePath)) {
			fs.writeFileSync(this.gitIgnorePath, '', 'utf-8');
		}
		let content = fs.readFileSync(this.gitIgnorePath, 'utf-8');

		if (!content.endsWith('\n')) {
			content = content + '\n';
		}

		for (const file of IGNORED_FILES) {

			if (!content.includes(file)) {
				content = content + file + '\n';
				fs.writeFileSync(this.gitIgnorePath, content, 'utf-8')
			}

		}

		await this.addIgnoreFileToGit();
	}

	private async addIgnoreFileToGit() {
		try {
			await execa('git', ['add', this.gitIgnorePath])
		}
		catch (error) {
			logger.info('Error while trying to add .gitignore to project', error);
		}
	}
}