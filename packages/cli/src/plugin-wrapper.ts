import path, { extname } from 'path';
import { compile } from './ts-compiler';
import fs from 'fs';
import { createProjectEntry } from './project-entry';
import { Dependencies, PluginDependencies, ProjectBuilder, ProjectContext, ValueProvider } from '../zupa';
import { PluginHelper } from './plugin-helper';
import { Project } from './project';
import { acquireValueOf } from './common/async-tools';
import Emittery from 'emittery';
import { ProjectDefinition } from './project-definition';

export type PluginAccess = string;

export class PluginWrapper {

	protected children: PluginWrapper[] = [];

	protected projectDefinition = new ProjectDefinition();

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

	async beforeLoad() {

	}

	async load() {
		await this.beforeLoad();

		let teardownCallback;
		try {
			const { workingPluginAccess, teardown } = await this.prepareWorkingPluginAccess();
			teardownCallback = teardown;

			const projectBuilder$ = this.assignGlobal(workingPluginAccess)
			await import(/* webpackIgnore: true */workingPluginAccess)

			const projectBuilder = await projectBuilder$

			await this.invokeProjectBuilder(projectBuilder)
		}
		catch (e) {
			throw new Error(`while loading ${this.pluginAccess}
			${e}`)
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

		// TODO 02-Sep-2021/zslengyel: better handling
		if (this.parent) {
			const basedir = path.dirname(this.parent.pluginAccess)
			workingPluginAccess = path.resolve(basedir, workingPluginAccess);
		}
		else {
			workingPluginAccess = path.resolve(process.cwd(), workingPluginAccess);
		}

		return { workingPluginAccess, teardown };
	}

	private assignGlobal(workingPluginAccess: string): Promise<ProjectBuilder> {

		const pluginHelper = new PluginHelper(this);

		const { project, resolver } = createProjectEntry(workingPluginAccess, pluginHelper);

		Object.assign(global, {
			project
		})

		return resolver.then((builder) => {
			// immediately de-assign

			Object.assign(global, {
				project: () => {
					throw new Error('project entry called outside of loading mechanism');
				}
			});

			return builder
		});
	}

	private async treatDependencies() {
		await acquireValueOf<Dependencies>(this.projectDefinition.dependencies, async (dependencies) => {

			// TODO 03-Sep-2021/zslengyel: check duplicate deps

			this.project.packageManager.registerDependencies(dependencies, this)
		})
	}

	private async treatPlugins() {
		await acquireValueOf(this.projectDefinition.plugins, async (pluginDeps) => {

			for (let pluginDep of pluginDeps) {

				const child = new PluginWrapper(this, pluginDep)

				this.children.push(child);

				await child.load();
			}
		});
	}

	//protected async treatCommands() {
	//
	//	for (let child of this.children) {
	//		await child.treatCommands();
	//	}
	//
	//	let commands = this.plugin.commands;
	//	if (!commands) {
	//		return;
	//	}
	//
	//	const prog = this.project.rootCommand();
	//
	//	const result = (value: any) => {
	//		this.project.commandResult = value;
	//	}
	//
	//	await commands.apply(this.plugin, [prog, { Command, result }]);
	//}

	protected async requirePlugin(pluginWrapper: PluginWrapper) {
		this.children.push(pluginWrapper)
		await pluginWrapper.load()
	}

	private async invokeProjectBuilder(projectBuilder: ProjectBuilder) {

		const context = this.buildProjectContext();
		await projectBuilder(context);

		await this.treatPlugins();
		await this.treatDependencies();
	}

	private buildProjectContext(): ProjectContext {

		return {
			name: (name: string) => {
				this.projectDefinition.defineName(name);
			},
			plugins: (content: ValueProvider<PluginDependencies>) => {
				this.projectDefinition.definePlugins(content)
			},
			dependencies: (content: ValueProvider<Dependencies>) => {
				this.projectDefinition.defineDependencies(content);
			}
		}
	}
}