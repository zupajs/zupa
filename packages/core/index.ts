
export const project: any = {};

interface PluginLoader {
	(name: string, config: any): Promise<void>;
}

class Config {
	patch(configPartial: any) {}
}

interface PrepareContext {
	plugin: PluginLoader;
	config: Config;
}

interface PrepareCallback {
	(prepareContext: PrepareContext): Promise<void>;
}

export function prepare(callback: PrepareCallback) {
	console.log('prepare invoked')

	project.prepares = (project.prepares || []);

	project.prepares.push(callback)
}

interface DependencyLoading {
	(name: string): void;
}

interface Command {
	$: CommandBuilder;
}

interface CommandConfigurator {
	(config: any): Command;
	is(command: string, args?: string[]): Command;
}

interface CommandBuilder {
	(nameExpression: TemplateStringsArray): CommandConfigurator;
}

interface DefineContext {
	pkg: any;
	dep: DependencyLoading;
	devDep: DependencyLoading;
	$: CommandBuilder
}

interface DefineCallback {
	(prepareContext: DefineContext): Promise<void>;
}

export function define(callback: DefineCallback) {
	console.log('define invoked')
}