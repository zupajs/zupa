import { Chalk } from 'chalk';
import * as minimist from 'minimist';
import * as Emittery from 'emittery';

export interface ProjectObject {
	argv: minimist.ParsedArgs;
	__dirname: string;
	events: Emittery;
	pkg: any; // TODO find package.jsom schema
	on: any; // TODO 17-Aug-2021/zslengyel:
	emit: any; // TODO 17-Aug-2021/zslengyel:
	dependencyRegistry: DependencyRegistry;

	run(): Promise<void>
}

export type PrepareContext = { plugin: PluginLoadInstruction } &
	DependencyRegistryPrepareApi &
	{ project: ProjectObject };

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
	projectDep(npmPackage: string): void;
	projectDeps(packagesMap: Record<string, string>): void;
}

export interface PackageManager {
	getAvailableVersions(packageName: string): Promise<string[]>;

	install(deps: string[]): Promise<void>;

	toString(): string;
}

export interface DependencyRegistry {
	registry: DependencyRegistryStore;
	controller: DependencyRegistryController;
	prepareApi: DependencyRegistryPrepareApi;
	defineApi: DependencyRegistryDefineApi;

	setPackageManager(pm: PackageManager): void;
}

export interface CommandArgumentsDefinition {
	required?: boolean;
}

export interface CommandArgumentsDefinitions extends Record<string, CommandArgumentsDefinition> {}

export interface CommandOptionsDefinitions {
	// TODO 30-Aug-2021/zslengyel:
}

export interface CommandConfig {
	args: CommandArgumentsDefinitions;
	options: CommandOptionsDefinitions;
	run(argv: Record<string, any>, options: Record<string, any>): Promise<any> | any;
}

export interface CommandConfigurator {
	(config: CommandConfig): Command;
}

export type SubcommandFunction = CommandBuilder;

export interface Command {
	execute(args: string[], options: Record<string, any>);
	commandName: string;
	config: CommandConfig;
	subcommands: Command[];
	subcommand: SubcommandFunction;
	$: SubcommandFunction;
	matchingCommandName(): string;
	findMatching(args: []): Command | undefined;
}

export interface CommandBuilder {
	(commandName: string): CommandConfigurator;
}


export type DefineContext = { project: ProjectObject } &
	{ log: Log } &
	{ pkg: any; } &
	{ $: CommandBuilder } &
	{ commands: Command } &
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
