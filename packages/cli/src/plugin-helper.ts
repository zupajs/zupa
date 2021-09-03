import { PluginWrapper } from './plugin-wrapper';

export class PluginHelper {

	constructor(
		protected pluginWrapper: PluginWrapper,
	) {
	}

	get project() {
		return this.pluginWrapper.project
	}

	findNpmPackageAlias(packageName: string) {
		const pack = this.project.packageManager.findPackage(packageName, this.pluginWrapper)

		return pack.alias;
	}
}