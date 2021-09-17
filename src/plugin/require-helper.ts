import { createRequire } from 'module'
import { Project } from '../project';
import { PluginWrapper } from './plugin-wrapper';

export class RequireHelper {

	private packagesInstalled = false;

	constructor(
		protected project: Project
	) {
		this.project.events.on('install:after', () => {
			this.packagesInstalled = true;
		})
	}

	findNpmPackageAlias(packageName: string, pluginWrapper: PluginWrapper) {
		const pack = this.project.packageManager.findPackage(packageName, pluginWrapper)

		return pack.alias;
	}

	require(packagePath: string, pluginWrapper: PluginWrapper) {
		if (!this.packagesInstalled) {
			throw new Error('packages are not installed yet. Please use `require` in a hook function, or in event handler')
		}

		// try to load named plugin first
		const plugin = this.project.findChildById(packagePath);
		if (plugin) {
			return plugin.exports;
		}

		const req = createRequire(this.project.pluginImport.path)
		const alias = this.findNpmPackageAlias(packagePath, pluginWrapper)
		return req(alias)
	}
}