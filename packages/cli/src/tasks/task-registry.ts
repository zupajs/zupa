import { Async, Task, TaskConfiguration } from '../../zupa';
import minimist from 'minimist';
import { configStore } from '../config/config';
import { logger } from '../log';

class TaskImpl implements Task {

	private _invoked = false;
	_configuration: TaskConfiguration | null = null;

	constructor(private _name: string) {
	}

	get invoked() {
		return this._invoked;
	}

	get name() {
		return this._name;
	}

	get configuration() {
		if (!this._configuration) {
			throw new Error(`Task '${this.name}' is not configured yet`)
		}
		return this._configuration as TaskConfiguration;
	}

	configure(handler: () => Async<unknown>) {
		this._configuration = { handler };

		return this;
	}

	public async invoke(): Promise<unknown> {
		return await this.configuration.handler();
	}

}

export class TaskRegistry {

	private _tasks = new Map<string, Task>();

	get tasks() {
		return this._tasks;
	}

	get(name: string) {
		if (this.tasks.has(name)) {
			return this.tasks.get(name)!
		}

		const task = new TaskImpl(name);

		this.tasks.set(name, task)

		return task;
	}

	async invoke() {
		const parsed = minimist(process.argv.splice(2));

		let taskName = parsed._[0];

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

		const result = await task.invoke()

		logger.result({ message: result })
	}
}