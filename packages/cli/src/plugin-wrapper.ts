import { extname } from 'path';
import { compile } from './ts-compiler';
import fs from 'fs';
import { createPluginClass } from './plugin-class';

export type PluginAccess = string;

export class PluginWrapper {

	constructor(protected pluginAccess: PluginAccess) {}

	async load() {


		let teardownCallback;
		try {
			const { workingPluginAccess, teardown } = await this.prepareWorkingPluginAccess();
			teardownCallback = teardown;

			console.log(`Load: ${workingPluginAccess}`)
			this.assignGlobal(workingPluginAccess)
			const pluginDef = await import(/* webpackIgnore: true */workingPluginAccess)

			const pluginClass = pluginDef.default.default as ReturnType<typeof createPluginClass>;
			const pluginInstance = new pluginClass()

			await pluginInstance.onPrepare()
			await pluginInstance.onLoad()

			console.log(pluginInstance.name())
			console.dir(pluginInstance)
		}
		finally {
			if (teardownCallback) {
				teardownCallback()
			}
		}
	}

	private async prepareWorkingPluginAccess() {
		let workingPluginAccess = this.pluginAccess;
		let teardown = () => {};

		const ext = extname(this.pluginAccess)
		if (ext === '.ts') {
			workingPluginAccess = await compile(this.pluginAccess)
			teardown = () => fs.rmSync(workingPluginAccess)
		}

		return { workingPluginAccess, teardown };
	}

	private assignGlobal(workingPluginAccess: string) {

		const Plugin = createPluginClass(workingPluginAccess);

		Object.assign(global, {
			Plugin
		})
	}
}