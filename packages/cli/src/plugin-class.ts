import { createRequire } from 'module'
import { PluginHelper } from './plugin-helper';

export function createPluginClass(filepath: string, pluginHelper: PluginHelper) {

	const Plugin = class implements ZupaPlugin {

		constructor() {}

		pluginPath(): string {
			return filepath;
		}

		name(): string {
			return this.pluginPath()
		}

		require(packageName: string) {
			const req = createRequire(pluginHelper.project.pluginAccess)

			const alias = pluginHelper.findNpmPackageAlias(packageName)

			return req(alias)
		}

	}

	return Plugin;
}