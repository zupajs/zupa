import path, { extname } from 'path';
import { compile } from '../ts-compiler';
import fs from 'fs';
import { createProjectEntry } from './project-entry';
import {
	Dependencies,
	PluginImport,
	PluginImports,
	PluginOptions,
	ProjectBuilder,
	ProjectContext,
	TasksBuilder,
	ValueProvider
} from '../../zupa';
import { acquireValueOfArray } from '../common/async-tools';
import Emittery from 'emittery';
import { ProjectDefinition } from './project-definition';
import { ProjectAware } from './project-aware';
import { isArray } from 'lodash'
import { logger } from '../log';

export type PluginImportConfig = {
	path: string;
	options: PluginOptions;
};

export class PluginWrapper extends ProjectAware {

	private _pluginExports: any = undefined;

	constructor(
		parent: PluginWrapper | null,
		protected _pluginImport: PluginImport,
		protected children: PluginWrapper[] = [],
		protected projectDefinition = new ProjectDefinition(),
		public readonly events: Emittery = new Emittery()
	) {
		super(parent);
	}

	get id(): string {
		if (this.pluginImport.options?.id) {
			return this.pluginImport.options.id;
		}

		return path.dirname(this.pluginPath)
	}

	get exports() {
		return this._pluginExports;
	}

	get options() {
		return this.pluginImport.options;
	}

	get pluginImport(): PluginImportConfig {
		const pluginImport = this._pluginImport;

		if (typeof pluginImport === 'string') {
			return {
				path: pluginImport,
				options: {}
			}
		}

		if (isArray(pluginImport) && pluginImport.length > 0) {
			return {
				path: pluginImport[0],
				options: pluginImport[1] || {} // note: options is optional
			}
		}

		throw new Error('Unsupported plugin import instruction. It must be either a string or an array.')
	}

	get pluginPath(): string {
		return this.pluginImport.path;
	}

	async load(): Promise<void> {
		await this.events.emitSerial('load:before');

		let teardownCallback;
		try {
			const { workingPluginAccess, teardown } = await this.prepareWorkingPluginAccess();
			teardownCallback = teardown;

			const projectBuilder$ = this.assignGlobal();

			// FIXME 06-Sep-2021/zslengyel: as nature of Node.js require caches modules,
			//  this does not work for duplicate plugin-imports

			await import(/* webpackIgnore: true */workingPluginAccess)

			const projectBuilder = await projectBuilder$

			await this.invokeProjectBuilder(projectBuilder)

			await this.events.emitSerial('load:after');
		}
		catch (e) {
			throw new Error(`while loading ${this.pluginImport.path}
			${e}`)
		}
		finally {
			if (teardownCallback) {
				teardownCallback()
			}
		}
	}

	private async prepareWorkingPluginAccess() {
		const pluginImport = this.pluginImport;
		const pluginPath = pluginImport.path;
		let workingPluginAccess = pluginPath;

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		let teardown = () => {};

		const ext = extname(pluginPath)
		if (ext === '.ts') {
			workingPluginAccess = await compile(pluginPath)
			teardown = () => fs.rmSync(workingPluginAccess)
		}

		// TODO 02-Sep-2021/zslengyel: better handling
		if (this.parent) {
			const basedir = path.dirname(this.parent.pluginImport.path)
			workingPluginAccess = path.resolve(basedir, workingPluginAccess);
		}
		else {
			workingPluginAccess = path.resolve(process.cwd(), workingPluginAccess);
		}

		return { workingPluginAccess, teardown };
	}

	private assignGlobal(): Promise<ProjectBuilder> {

		const { project, resolver } = createProjectEntry();

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
		await acquireValueOfArray(this.projectDefinition.dependencies, async (dependencies) => {

			// TODO 03-Sep-2021/zslengyel: check duplicate deps
			dependencies.forEach(deps =>
				this.project.packageManager.registerDependencies(deps, this)
			)
		})
	}

	private async treatPlugins() {

		await acquireValueOfArray(this.projectDefinition.plugins, async (pluginDepsDefs) => {

			for (const pluginDeps of pluginDepsDefs) {
				for (const pluginDep of pluginDeps) {

					const child = new PluginWrapper(this, pluginDep)

					this.children.push(child);

					await child.load();
				}
			}
		});
	}

	protected async treatCommands(): Promise<void> {

		for (const child of this.children) {
			await child.treatCommands();
		}

		const commandsBuilders = this.projectDefinition.tasksBuilders;

		const commandBuildings = commandsBuilders.map(async taskBuilder => {

			const task = (name: string) => {
				return this.project.taskRegistry.get(name)
			}

			return taskBuilder.apply(null, [task]);
		})

		await Promise.all(commandBuildings)
	}

	protected async requirePlugin(pluginWrapper: PluginWrapper): Promise<void> {
		this.children.push(pluginWrapper)
		await pluginWrapper.load()
	}

	private async invokeProjectBuilder(projectBuilder: ProjectBuilder) {

		const context = this.buildProjectContext();
		this._pluginExports = await projectBuilder(context);

		await this.treatPlugins();
		await this.treatDependencies();
	}

	private buildProjectContext(): ProjectContext {

		return {
			name: (name: string) => {
				this.projectDefinition.defineName(name);
			},
			plugins: (content: ValueProvider<PluginImports>) => {
				this.projectDefinition.definePlugins(content)
			},
			dependencies: (content: ValueProvider<Dependencies>) => {
				this.projectDefinition.defineDependencies(content);
			},
			tasks: (taskBuilder: TasksBuilder) => {
				this.projectDefinition.defineTasksBuilder(taskBuilder)
			},
			require: (packageName: string) => {
				return this.project.requireHelper.require(packageName, this)
			},
			project: this.project,
			options: this.options,
			logger: logger
		}
	}

	findChildById(pluginId: string): PluginWrapper | null {

		for (const child of this.children) {

			if (child.id === pluginId) {
				return child;
			}
			const possiblePlugin = child.findChildById(pluginId)

			if (possiblePlugin) {
				return possiblePlugin
			}
		}

		return null;
	}

	toString() {
		return this.pluginPath
	}
}