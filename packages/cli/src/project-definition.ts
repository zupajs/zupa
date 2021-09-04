import { Dependencies, PluginDependencies, ValueProvider } from '../zupa';

export class ProjectDefinition {

	private _dependencies!: ValueProvider<Dependencies>;
	private _name!: string;
	private _plugins!: ValueProvider<PluginDependencies>;

	// Getters

	get dependencies(): ValueProvider<Dependencies> {
		return this._dependencies;
	}

	get name(): string {
		return this._name;
	}

	get plugins(): ValueProvider<PluginDependencies> {
		return this._plugins;
	}

	// Definers

	defineDependencies(content: ValueProvider<Dependencies>) {
		this._dependencies = content;
	}

	defineName(name: string) {
		this._name = name;
	}

	definePlugins(content: ValueProvider<PluginDependencies>) {
		this._plugins = content;
	}
}