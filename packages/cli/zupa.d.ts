import winston from 'winston';

export interface TaskConfiguration {
	handler(...depResults: any[]): any;
}

export interface Task<Result = unknown> {
	name: string;
	invoked: boolean;
	configuration: TaskConfiguration;
	invoke(force?: boolean): Async<any>;
	
	configure<R = Result>(handler: (...depResults: any[]) => Async<R>): Task<R>;
	dependsOn(...depTasks: Task[]): Task;
}

export type DetailedDependency = {
	packageName: string;
	version: string;
	registry?: string;
	noalias?: boolean;
};

export type Dependency = string | DetailedDependency;
export type Dependencies = Dependency[];

export type PluginOptions = {
	[opt: string]: unknown;
}
export type DetailedPluginImport =  [string, PluginOptions];
export type PluginImport = string | DetailedPluginImport;
export type PluginImports = PluginImport[];

export type Async<T> = Promise<T> | T;
export type ValueProvider<T> = T | (() => Async<T>)

export type TasksBuilder = (taskGetter: (name: string) => Task) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Project {}

export interface ProjectContext {

	dependencies: (content: ValueProvider<Dependencies>) => void;

	plugins: (content: ValueProvider<PluginImports>) => void;

	name: (name: string) => void;

	// TODO 04-Sep-2021/zslengyel:
	tasks: (taskBuilder: TasksBuilder) => Async<void>;

	require: <T = any>(pack: string) => T;

	project: Project;

	options: any;

	logger: winston.Logger;
}

export interface ProjectBuilder {
	(projectContext: ProjectContext): Async<void>;
}

export interface ProjectEntry {
	(projectBuilder: ProjectBuilder): void;
}

declare global {
	const project: ProjectEntry;
}

export default global;