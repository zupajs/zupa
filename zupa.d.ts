import winston from 'winston';
import chalk from 'chalk';

export interface LogRecord {
	level: string;
	message: string | any | number;
	data: any;
}

export interface TaskConfiguration {
	handler(...depResults: any[]): any;
}

export type OutputTransform = 'json' | 'raw' | 'table' | 'tree' | string;

export interface Task<Result = unknown> {
	name: string;
	invoked: boolean;
	configuration: TaskConfiguration;
	outputTransform: OutputTransform;

	invoke(force?: boolean): Async<any>;

	handle<R = Result>(handler: (...depResults: any[]) => Async<R>): Task<R>;

	dependsOn(...depTasks: Task[]): Task;

	preferOutputTransform(outputTransform: OutputTransform): Task<R>;
}

export type DetailedDependency = {
	packageName: string;
	version: string;
	registry?: string;
	noalias?: boolean;
};

export type Dependency = string | DetailedDependency;
export type Dependencies = Dependency[];

export interface Config {
	tasks: {
		default: string;
	};
	output: {
		formatters: {
			[key: string]: (logRecord: LogRecord) => string;
		}
	};
	deps: {
		removePackageJson: boolean;
	},
	log: {
		verbose: boolean;
	};

	[key: string]: unknown;
}

export type PluginOptions = {
	[opt: string]: unknown;
}
export type DetailedPluginImport = [string, PluginOptions];
export type PluginImport = string | DetailedPluginImport;
export type PluginImports = PluginImport[];

export type Async<T> = Promise<T> | T;
export type ValueProvider<T, Parameter = void> = T | ((param: Parameter) => Async<T>)

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

	config: Config;
	configure: (configBuilder: ValueProvider<Partial<Config>, Config>) => void;

	utils: {
		chalk: typeof chalk;
		[custom: string]: any;
	}
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