import { NpmController, Package } from './npm-controller';
import { groupBy } from 'lodash-es';
import md5 from 'md5';
import { PluginWrapper } from '../plugin/plugin-wrapper';
import { Dependencies, DetailedDependency } from '../../zupa';
import { getCallerSourcePos } from '../common/stacktrace';
import { logger } from '../log';

class DepSource {

	constructor(
		private file: string,
		private line: number,
		private pos: number
	) {}

	toString() {
		return `${this.file}:${this.line}:${this.pos}`
	}
}

type Dep = {
	packageName: string;
	version: string;
	sources: DepSource[];
	registry?: string;
	plugins: PluginWrapper[];
	alias: string;
}
type DepsRegistry = Dep[];

export class PackageManager {

	constructor(
		protected npmManager = new NpmController(),
		protected readonly _dependencies: DepsRegistry = []
	) {}

	get dependencies(): DepsRegistry {
		return [...this._dependencies];
	}

	registerDependencies(dependencyList: Dependencies, plugin: PluginWrapper): void {

		const sourcePos = getCallerSourcePos()

		const source = new DepSource(
			plugin.pluginImport.path,
			sourcePos.line, sourcePos.pos
		);

		for (const dep of dependencyList) {
			if (typeof dep === 'string') {

				const parts = dep.split('@')
				const packageName = parts[0];
				const version = parts[1];

				this.addDep({
					packageName,
					version,
				}, plugin, source)
			}
			else {
				this.addDep(dep, plugin, source)
			}
		}
	}

	addDep(dep: DetailedDependency, plugin: PluginWrapper, source: DepSource): void {

		this.validateDependency(dep, plugin);

		const duplicate = this.findDuplicate(dep);
		if (duplicate !== undefined) {
			// TODO 13-Sep-2021/zslengyel: handle alias

			duplicate.sources.push(source);
			duplicate.plugins.push(plugin);

			duplicate.alias = generateAlias(dep, ...[plugin, ...duplicate.plugins]);

			logger.verbose(`Linked to existing dependency: ${duplicate.packageName}@${duplicate.version}`);
			return;
		}

		let alias;
		if (dep.noalias === true) {

			alias = dep.packageName;
		}
		else {

			alias = generateAlias(dep, plugin);
		}

		const registered = {
			alias,
			packageName: dep.packageName,
			version: dep.version,
			registry: dep.registry,
			plugins: [plugin],
			sources: [source]
		};

		logger.verbose(`Registered dependency: ${registered.packageName}@${registered.version}`);

		this._dependencies.push(registered);
	}

	findPackage(packageName: string, plugin: PluginWrapper): Dep {
		const npmPackage = this._dependencies.find(dep => {
			return dep.packageName === packageName && dep.plugins.includes(plugin);
		})

		if (!npmPackage) {
			throw new Error(`Cannot find package: ${packageName} in ${plugin.pluginImport}`)
		}

		return npmPackage;
	}

	async installDependencies(): Promise<void> {

		await this.checkUnversionedDeps()

		const depsByRegistry = groupBy(this._dependencies, dep => dep.registry || '')

		for (const [registry, deps] of Object.entries(depsByRegistry)) {

			const packages: Package[] = deps.map(dep => {
				return ({
					packageName: dep.packageName,
					version: dep.version,
					alias: dep.alias
				});
			});

			await this.npmManager.install(packages, registry)
		}

	}

	async checkUnversionedDeps() {
		const unversionedDeps = this._dependencies.filter(dep => {
			return !dep.version;
		});

		if (unversionedDeps.length > 0) {

			const suggestions = [];

			for (const dep of unversionedDeps) {
				try {
					const versions = await this.npmManager.getAvailableVersions(dep.packageName)
					const version = versions[versions.length - 1]

					suggestions.push(`${dep.packageName}@${version}`)
				}
				catch (e) {
					suggestions.push(`No package found: ${dep.packageName}`);
				}
			}

			throw new Error(`Missing versions for npm packages.
Latest versions of packages:
\t${suggestions.join('\n\t')}
			`)
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private validateDependency(dep: DetailedDependency, source: PluginWrapper) {
		// TODO 06-Sep-2021/zslengyel:
		//assert.ok(typeof dep.version === 'string' && dep.version.length > 0,
		//	`Dependency version must be set of ${dep.packageName} at ${source.toString()}`)
	}

	private findDuplicate(dep: DetailedDependency) {
		return this._dependencies.find(existing => {
			return existing.packageName === dep.packageName &&
				existing.version === dep.version &&
				existing.registry === dep.registry;
		});
	}
}

function generateAlias(dep: DetailedDependency, ...plugins: PluginWrapper[]) {
	const paths = plugins.map(plugin => plugin.pluginImport.path).join('');

	const depFootPrint = `${dep.packageName}${dep.version}${paths}`;
	const hash = md5(depFootPrint)
	const base64Hash = hash.toString();

	return `${dep.packageName}-${base64Hash}`
}