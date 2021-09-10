import { Async, OutputTransform, Task, TaskConfiguration } from '../../zupa';
import minimist from 'minimist';
import { configStore } from '../config/config';
import { logger } from '../log';

class TaskImpl<R = unknown> implements Task<R> {

	private _invoked = false;
	_configuration: TaskConfiguration | null = null;
	_dependencies: Set<Task> = new Set()
	private _result: any;
	private _outputTransform: OutputTransform = 'raw';

	constructor(private _name: string) {
	}

	get outputTransform() {
		return this._outputTransform;
	}

	get invoked() {
		return this._invoked;
	}

	get name() {
		return this._name;
	}

	get dependencies() {
		return this._dependencies;
	}

	get configuration() {
		if (!this._configuration) {
			throw new Error(`Task '${this.name}' is not configured yet`)
		}
		return this._configuration as TaskConfiguration;
	}

	handle(handler: () => Async<unknown>) {
		this._configuration = { handler };

		return this;
	}

	dependsOn(...depTasks: Task[]): Task<R> {

		depTasks.forEach(depTask => this._dependencies.add(depTask));

		return this;
	}

	preferOutputTransform(outputTransform: OutputTransform): Task<R> {
		this._outputTransform = outputTransform;
		return this;
	}

	public async invoke(force = false): Promise<unknown> {
		if (!force && this._invoked) {
			return this._result;
		}

		const depResults = await this.invokeDependencies(force)

		this._invoked = true;

		const handler = this.configuration.handler;
		this._result = await handler.call(null, ...depResults);

		return this._result;
	}

	private async invokeDependencies(force: boolean) {
		const results = Array.from(this._dependencies.values()).map(task => {
			return task.invoke(force)
		}) as Promise<any>[];

		return await Promise.all(results);
	}
}

export class TaskRegistry {

	private _tasks = new Map<string, Task>();

	get tasks(): Map<string, Task> {
		return this._tasks;
	}

	get(name: string): Task {
		if (this.tasks.has(name)) {
			return this.tasks.get(name)!
		}

		const task = new TaskImpl(name);

		this.tasks.set(name, task)

		return task;
	}

	async invoke() {
		const parsed = minimist(process.argv.splice(2), {
			boolean: 'forceTasks',
			alias: {
				f: 'forceTasks'
			}
		});

		let taskName = parsed._[0];
		const forceTasks = parsed.forceTasks as boolean;

		if ((taskName || '').length === 0) {
			taskName = configStore.get().tasks.default;
		}

		if (!taskName) {
			return; // nothing to do
		}

		if (!this.tasks.has(taskName)) {
			throw new Error(`Task '${taskName}' is not registered.`)
		}

		const task = this.tasks.get(taskName)!

		const result = await task.invoke(forceTasks)

		logger.result({
			message: result,
			data: {
				preferredTransform: task.outputTransform
			}
		})
	}
}