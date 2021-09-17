import path from 'path';
import { createProjectEntry } from './project-entry';
import {
	Config,
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
import { isArray } from 'lodash-es'
import { logger } from '../log';
import { parsePluginPath } from './plugin-utils';
import { ZUPA_DIR } from '../zupa-dir';
import { configStore } from '../config/config';
import chalk from 'chalk';

const ZUPA_PACAKGE_PREFIX = '@zupa';

export type PluginImportConfig = {
	id?: string;
	path: string;
	options: PluginOptions;
};

export class PluginWrapper extends ProjectAware {

	private _pluginExports: any = undefined;

	constructor(
		parent: PluginWrapper | null,
		protected _pluginImport: PluginImport,
		protected _children: PluginWrapper[] = [],
		protected _projectDefinition = new ProjectDefinition(),
		public readonly events: Emittery = new Emittery()
	) {
		super(parent);
	}

	get definition() {
		return this._projectDefinition;
	}

	get children(): PluginWrapper[] {
		return this._children;
	}

	get id(): string {
		if (this.pluginImport.id) {
			return this.pluginImport.id;
		}

		return this.pluginImport.path;
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
			const { id, path } = parsePluginPath(pluginImport);
			return {
				id,
				path,
				options: {}
			}
		}

		if (isArray(pluginImport) && pluginImport.length > 0) {
			const { id, path } = parsePluginPath(pluginImport[0]);
			return {
				id,
				path,
				options: pluginImport[1] || {} // note: options is optional
			}
		}

		throw new Error('Unsupported plugin import instruction. It must be either a string or an array.')
	}

	get pluginPath(): string {
		return this.prepareWorkingPluginAccess().workingPluginAccess;
	}

	async load(): Promise<void> {
		await this.events.emitSerial('load:before', {
			plugin: this
		});

		let teardownCallback;
		try {
			const { workingPluginAccess, teardown } = this.prepareWorkingPluginAccess();
			teardownCallback = teardown;

			const projectBuilder$ = this.assignGlobal();

			// FIXME 06-Sep-2021/zslengyel: as nature of Node.js require caches modules,
			//  this does not work for duplicate plugin-imports

			// eslint-disable-next-line node/no-unsupported-features/es-syntax
			await import(/* webpackIgnore: true */workingPluginAccess)

			const projectBuilder = await projectBuilder$

			await this.invokeProjectBuilder(projectBuilder)

			await this.events.emitSerial('load:after', {
				plugin: this
			});
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

	private prepareWorkingPluginAccess() {
		const pluginImport = this.pluginImport;
		const pluginPath = pluginImport.path;
		let workingPluginAccess = pluginPath;

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const teardown = () => {};

		//const ext = extname(pluginPath)
		//if (ext === '.ts') {
		//	workingPluginAccess = await compile(pluginPath)
		//	teardown = () => fs.rmSync(workingPluginAccess)
		//}

		if (pluginPath.startsWith(ZUPA_PACAKGE_PREFIX)) {
			const zupaPath = pluginPath.replace(ZUPA_PACAKGE_PREFIX, ZUPA_DIR);
			workingPluginAccess = zupaPath;
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
		await acquireValueOfArray(this._projectDefinition.dependencies, async (dependencies) => {

			// TODO 03-Sep-2021/zslengyel: check duplicate deps
			dependencies.forEach(deps =>
				this.project.packageManager.registerDependencies(deps, this)
			)
		})
	}

	private async treatConfigure() {

		await acquireValueOfArray(this._projectDefinition.configureBuilders, async (configPathces) => {
			const patches = configPathces as Partial<Config>[];

			for (const patch of patches) {
				configStore.patch(patch);
			}

		}, [configStore.get()])

	}

	private async treatPlugins() {

		await acquireValueOfArray(this._projectDefinition.plugins, async (pluginDepsDefs) => {

			for (const pluginDeps of pluginDepsDefs) {
				for (const pluginDep of pluginDeps) {

					const child = new PluginWrapper(this, pluginDep)

					this._children.push(child);

					await child.load();
				}
			}
		});
	}

	protected async treatCommands(): Promise<void> {

		for (const child of this._children) {
			await child.treatCommands();
		}

		const commandsBuilders = this._projectDefinition.tasksBuilders;

		const commandBuildings = commandsBuilders.map(async taskBuilder => {

			const task = (name: string) => {
				return this.project.taskRegistry.get(name)
			}

			return taskBuilder.apply(null, [task]);
		})

		await Promise.all(commandBuildings)
	}

	protected async requirePlugin(pluginWrapper: PluginWrapper): Promise<void> {
		this._children.push(pluginWrapper)
		await pluginWrapper.load()
	}

	private async invokeProjectBuilder(projectBuilder: ProjectBuilder) {

		const context = this.buildProjectContext();
		this._pluginExports = await projectBuilder(context);

		await this.treatConfigure();
		await this.treatPlugins();
		await this.treatDependencies();
	}

	private buildProjectContext(): ProjectContext {

		return {
			name: (name: string) => {
				this._projectDefinition.defineName(name);
			},
			plugins: (content: ValueProvider<PluginImports>) => {
				this._projectDefinition.definePlugins(content)
			},
			dependencies: (content: ValueProvider<Dependencies>) => {
				this._projectDefinition.defineDependencies(content);
			},
			tasks: (taskBuilder: TasksBuilder) => {
				this._projectDefinition.defineTasksBuilder(taskBuilder)
			},
			require: (packageName: string) => {
				return this.project.requireHelper.require(packageName, this)
			},
			project: this.project,
			options: this.options,
			logger: logger,
			config: configStore.get(),

			utils: {
				chalk
			},

			configure: (configBuilder: ValueProvider<Partial<Config>, Config>) => {
				this._projectDefinition.defineConfigure(configBuilder);
			}
		}
	}

	findChildById(pluginId: string): PluginWrapper | null {

		for (const child of this._children) {

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

	toString(): string {
		return this.pluginPath
	}
}