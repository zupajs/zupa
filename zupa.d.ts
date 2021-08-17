import { Chalk } from 'chalk';
import * as minimist from 'minimist';
import * as Emittery from 'emittery';


export interface ScriptDefinition {
	(...params: string[]): void | Promise<void>;
}

export interface ScriptRegistryApi {
	script(name: string, scriptFn: ScriptDefinition): void;
}

export interface ScriptRegistryController {
	run(): Promise<void>
}

export interface ScriptRegistryStore {
	[name: string]: (...params) => void | Promise<void>;
}

export interface ScriptRegistry {
	api: ScriptRegistryApi;
	controller: ScriptRegistryController;
	registry: ScriptRegistryStore;
}


export interface ProjectObject {
	argv: minimist.ParsedArgs;
	__dirname: string;
	events: Emittery;
	pkg: any; // TODO find package.jsom schema
	on: any; // TODO 17-Aug-2021/zslengyel:
	emit: any; // TODO 17-Aug-2021/zslengyel:
	dependencyRegistry: DependencyRegistry;
	scriptRegistry: ScriptRegistry;

	run(): Promise<void>
}

export type PrepareContext = { plugin: PluginLoadInstruction } &
	DependencyRegistryPrepareApi;

export interface PrepareCallback {
	(context: PrepareContext): (void | Promise<void>);
}

export interface PrepareBlock {
	(callback: PrepareCallback): (void | Promise<void>);
}

export interface PrepareController {
	run(): Promise<void>
}

export interface Preparer {
	prepare: PrepareBlock;
	controller: PrepareController;
}


export interface PluginLoadInstruction {
	(path: string): Promise<void>;
}

export interface Log {
	(...args: any[]): void;

	isVerbose: boolean;

	info(...args: any[]): void;

	error(...args: any[]): void;
}

declare enum DepType {
	projectDep = 'projectDep',
	dep = 'dep',
	devDep = 'devDep'
}

export interface DependencyDescriptor {
	packageName: string;
	version: string;
	type: DepType;
}

export interface DependencyRegistryStore {
	deps: DependencyDescriptor[];
}

export interface DependencyRegistryController {
	addDepsToPackageJson(pkg: any): Promise<void>

	installProjectDeps();

	installDeps(): Promise<void>;
}

export interface DependencyRegistryDefineApi {
	dep(npmPackage: string): void;

	devDep(npmPackage: string): void;
}

export interface DependencyRegistryPrepareApi {
	projectDep(npmPackage): void;
}

export interface DependencyRegistry {
	registry: DependencyRegistryStore;
	controller: DependencyRegistryController;
	prepareApi: DependencyRegistryPrepareApi;
	defineApi: DependencyRegistryDefineApi;
}


export type DefineContext = ScriptRegistryApi &
	{ project: ProjectObject } &
	{ log: Log } &
	{ pkg: any; } &
	DependencyRegistryDefineApi;

export interface DefineBuilder {
	(context: DefineContext): (void | Promise<void>);
}


export interface DefineBlock {
	(callback: DefineBuilder): (void | Promise<void>);
}

export interface Definer {
	define: DefineBlock;
}

declare global {
	const prepare: PrepareBlock;
	const define: DefineBlock;
	const log: Log;
	const chalk: Chalk;
}

export default global;
