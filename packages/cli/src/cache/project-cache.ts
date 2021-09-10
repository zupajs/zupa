import hasha from 'hasha'
import { Project } from '../project';
import { PluginWrapper } from '../plugin/plugin-wrapper';
import path from 'path';
import * as fs from 'fs';
import { logger } from '../log';

const cacheFolder = path.resolve(process.cwd(), 'node_modules', '.zupa', 'cache')
const cacheFile = path.resolve(cacheFolder, 'project-hash')

export class ProjectCache {

	constructor(private readonly project: Project) {}

	async checkProjectUpToDate(updateCallback: () => Promise<void>, upToDateCallback: () => Promise<void>) {

		const projectHash = await this.hashPlugin(this.project)

		if (fs.existsSync(cacheFile) &&
			fs.readFileSync(cacheFile, { encoding: 'utf-8' }) === projectHash) {

			await upToDateCallback();

			logger.info('🪄 Project is up-to-date')
			return;
		}

		logger.info('Project files have been changed.')
		logger.info(`Write project hash in ${cacheFile}`)

		this.writeCacheFile(projectHash);

		await updateCallback()
	}

	async hashPlugin(plugin: PluginWrapper): Promise<string> {

		const pluginSelfHash = hasha.fromFileSync(plugin.pluginPath, { algorithm: 'md5' });

		const childHashes = await Promise.all(plugin.children.map(child => this.hashPlugin(child)));
		const childrenHash = childHashes.join('')

		return hasha(pluginSelfHash + childrenHash);
	}

	private writeCacheFile(projectHash: string) {
		if (!fs.existsSync(cacheFolder)) {
			logger.info(`Create cache folder ${cacheFolder}`)
			fs.mkdirSync(cacheFolder, {
				recursive: true
			})
		}

		fs.writeFileSync(cacheFile, projectHash, { encoding: 'utf-8' })
	}
}