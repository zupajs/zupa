import { Command, Option, CommandOptions, ParseOptionsResult } from 'commander';

export type DetailedDependency = { packageName: string; version: string; registry?: string }
export type Dependency = string | DetailedDependency;
export type Dependencies = Dependency[];

export type PluginDependency = string;
export type PluginDependencies = PluginDependency[];

export type Async<T> = Promise<T> | T;
export type ValueProvider<T> = T | ( () => Async<T> )

export interface Plugin {
	dependencies?: ValueProvider<Dependencies>;
	plugins?: ValueProvider<PluginDependencies>;
	readonly pluginPath(): string;
	name(): string;
	commands?: (cmd: Command, options: {}) => Async<void>;
}

type PluginAlias = Plugin;

export namespace Zupa {
	type Plugin = PluginAlias;
}

declare global {
	type ZupaPlugin = Plugin;
}

export default global;