import hasha from 'hasha'
import { Project } from '../project';
import { PluginWrapper } from '../plugin/plugin-wrapper';
import path from 'path';
import * as fs from 'fs';
import { logger } from '../log';

const cacheFolder = path.resolve(process.cwd(), 'node_modules', '.zupa', 'cache')

export class ProjectCache {

	constructor(private readonly project: Project) {}

	async checkProjectUpToDate(updateCallback: () => Promise<void>) {

		const projectHash = await this.hashPlugin(this.project)
		const projecHashPath = path.resolve(cacheFolder, projectHash)

		if (fs.existsSync(projecHashPath)) {
			logger.info('🪄 Project is up-to-date')
			return;
		}

		this.prepareCacheFolder();

		logger.info(`Write project hash in ${projecHashPath}`)
		fs.writeFileSync(projecHashPath, '', { encoding: 'utf-8' })

		await updateCallback()
	}

	async hashPlugin(plugin: PluginWrapper): Promise<string> {

		const pluginSelfHash = hasha.fromFileSync(plugin.pluginPath, { algorithm: 'md5' });

		const childHashes = await Promise.all(plugin.children.map(child => this.hashPlugin(child)));
		const childrenHash = childHashes.join('')

		return hasha(pluginSelfHash + childrenHash);
	}

	private prepareCacheFolder() {
		if (!fs.existsSync(cacheFolder)){
			logger.info(`Create cache folder ${cacheFolder}`)
			fs.mkdirSync(cacheFolder, {
				recursive: true
			})
		}
	}
}