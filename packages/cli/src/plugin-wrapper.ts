import path, { extname } from 'path';
import { compile } from './ts-compiler';
import fs from 'fs';
import { createPluginClass } from './plugin-class';
import { Dependencies, Zupa } from '../zupa';
import { PluginHelper } from './plugin-helper';
import { Project } from './project';
import { acquireValueOf } from './common/async-tools';
import Emittery from 'emittery';

export type PluginAccess = string;

export class PluginWrapper {

	protected plugin!: Zupa.Plugin;
	protected pluginClass!: ReturnType<typeof createPluginClass>;

	protected children: PluginWrapper[] = [];

	public readonly events: Emittery = new Emittery()

	constructor(
		public readonly parent: PluginWrapper | null,
		protected _pluginAccess: PluginAccess
	) {}

	get project(): Project {

		if (this.parent === null) {
			return (this as any) as Project;
		}

		return this.parent.project;
	}

	get pluginAccess() {
		return this._pluginAccess
	}

	async load() {
		let teardownCallback;
		try {
			const { workingPluginAccess, teardown } = await this.prepareWorkingPluginAccess();
			teardownCallback = teardown;

			//console.log(`Load: ${workingPluginAccess}`)

			this.assignGlobal(workingPluginAccess)
			const pluginDef = await import(/* webpackIgnore: true */workingPluginAccess)

			const pluginClassDef = pluginDef.default.default;
			if (!pluginDef.default?.default) {
				throw new Error(`
						Please export plugin as 'default' property.
						E.g.
							exports.default = class extends ZupaPlugin {}
				`);
			}
			const pluginClass = pluginClassDef as ReturnType<typeof createPluginClass>;
			this.pluginClass = pluginClass;

			this.plugin = new pluginClass()

			await this.treatPlugins();

			await this.treatDependencies();
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

		// TODO 02-Sep-2021/zslengyel: better handlign
		workingPluginAccess = path.resolve(process.cwd(), workingPluginAccess);

		return { workingPluginAccess, teardown };
	}

	private assignGlobal(workingPluginAccess: string) {

		const pluginHelper = new PluginHelper(this);

		const ZupaPlugin = createPluginClass(workingPluginAccess, pluginHelper);

		Object.assign(global, {
			ZupaPlugin
		})
	}

	private async treatDependencies() {
		await acquireValueOf<Dependencies>(this.plugin.dependencies, async (dependencies) => {

			// TODO 03-Sep-2021/zslengyel: check duplicate deps

			this.project.packageManager.registerDependencies(dependencies, this)
		})
	}

	private async treatPlugins() {
		await acquireValueOf(this.plugin.plugins, async (pluginDeps) => {

			for (let pluginDep of pluginDeps) {

				const child = new PluginWrapper(this, pluginDep)

				this.children.push(child);

				await child.load();
			}
		});
	}

	protected async treatCommands() {

		for (let child of this.children) {
			await child.treatCommands();
		}

		let commands = this.plugin.commands;
		if (!commands) {
			return;
		}

		const prog = this.project.rootCommand();

		const result = (value: any) => {
			this.project.commandResult = value;
		}

		await commands.apply(this.plugin, [prog, { result }]);
	}

}