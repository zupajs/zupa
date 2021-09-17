import { PluginWrapper } from './plugin/plugin-wrapper';
import { PackageManager } from './package-manager/package-manager';
import { RequireHelper } from './plugin/require-helper';
import { Project as ZupaProject } from '../zupa'
import { TaskRegistry } from './tasks/task-registry';
import { ProjectCache } from './cache/project-cache';

export class Project extends PluginWrapper implements ZupaProject {

	protected _packageManager = new PackageManager();
	private _taskRegistry = new TaskRegistry();
	public readonly requireHelper = new RequireHelper(this);
	public readonly cache = new ProjectCache(this);

	constructor(
		pluginAccess: string,
	) {
		super(null, pluginAccess);

		this.listenEvents();
	}

	private listenEvents() {
		this.events.on('load:before', async () => {
			await this.requirePlugin(new PluginWrapper(
				this,
				'@zupa/core-plugins/core-plugins.js'
			))
		})
	}

	get packageManager() {
		return this._packageManager
	}

	get taskRegistry() {
		return this._taskRegistry
	}

	async run() {

		await this.cache.checkProjectUpToDate(
			async () => {
				await this.installDependencies();
			},
			async () => {
				await this.events.emitSerial('install:after')
			});

		await this.treatCommands();

		await this.events.emitSerial('tasks:run:before')

		await this._taskRegistry.invoke();

		await this.events.emitSerial('tasks:run:after')
	}

	private async installDependencies() {
		await this.events.emitSerial('install:before')

		await this.packageManager.installDependencies();

		await this.events.emitSerial('install:after')
	}

}
