import { createRequire } from 'module'
import { Project } from '../project';
import { PluginWrapper } from './plugin-wrapper';
import { URL } from 'url';

enum LoadMode {
	NATIVE,
	PLUGIN
}

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

	require(packageName: string, pluginWrapper: PluginWrapper) {
		if (!this.packagesInstalled) {
			throw new Error('packages are not installed yet. Please use `require` in a hook function, or in event handler')
		}

		let loadMode = LoadMode.NATIVE;
		let packagePath = packageName;

		try {
			const url = new URL(packageName);
			if (url.protocol === 'plugin:') {
				loadMode = LoadMode.PLUGIN;
				packagePath = url.hostname
			}
			else {
				throw new Error(`Illegal require parameter: ${packageName}`)
			}
		}
		catch (e) {
			// NOT AN URL
		}

		if (loadMode === LoadMode.NATIVE) {
			const req = createRequire(this.project.pluginImport.path)

			const alias = this.findNpmPackageAlias(packagePath, pluginWrapper)

			return req(alias)
		}
		else if (loadMode === LoadMode.PLUGIN) {
			const plugin = this.project.findChildById(packagePath);

			if (!plugin) {
				throw new Error(`Cannot find plugin by id: ${packagePath}`)
			}

			return plugin.exports;
		}
		else {
			throw new Error('This should not happen')
		}
	}
}