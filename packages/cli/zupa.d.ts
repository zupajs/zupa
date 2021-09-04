import { Command } from 'commander';

export type DetailedDependency = { packageName: string; version: string; registry?: string }
export type Dependency = string | DetailedDependency;
export type Dependencies = Dependency[];

export type PluginDependency = string;
export type PluginDependencies = PluginDependency[];

export type Async<T> = Promise<T> | T;
export type ValueProvider<T> = T | ( () => Async<T> )

export interface ProjectContext {

	dependencies: (content: ValueProvider<Dependencies>) => void;

	plugins: (content: ValueProvider<PluginDependencies>) => void;

	name: (name: string) => void;

	// TODO 04-Sep-2021/zslengyel:
	//commands?: (cmd: Command, options: {}) => Async<void>;
	//
	//createCommand(name?: string): Command;

}

export interface ProjectBuilder {
	(projectContext: ProjectContext): Async<void>;
}

export interface ProjectEntry {
	(projectBuilder: ProjectBuilder): void;
}

declare global {
	project: ProjectEntry;
}

export default global;