import { Dependencies, PluginImports, TasksBuilder, ValueProvider } from '../../zupa';

export class ProjectDefinition {

	private _dependencies: ValueProvider<Dependencies>[] = [];
	private _name!: string;
	private _plugins: ValueProvider<PluginImports>[] = [];
	private _tasksBuilders: TasksBuilder[] = [];

	// Getters

	get tasksBuilders(): TasksBuilder[] {
		return this._tasksBuilders;
	}

	get dependencies(): ValueProvider<Dependencies>[] {
		return this._dependencies;
	}

	get name(): string {
		return this._name;
	}

	get plugins(): ValueProvider<PluginImports>[] {
		return this._plugins;
	}

	// Definers

	defineDependencies(content: ValueProvider<Dependencies>): void {
		this._dependencies.push(content);
	}

	defineName(name: string): void {
		this._name = name;
	}

	definePlugins(content: ValueProvider<PluginImports>): void {
		this._plugins.push(content);
	}

	defineTasksBuilder(tasksBuilder: TasksBuilder): void {
		this._tasksBuilders.push(tasksBuilder);
	}
}