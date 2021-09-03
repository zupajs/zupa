import { NpmManager, Package } from './npm-manager';
import { groupBy } from 'lodash';
import CryptoJS from 'crypto-js';
import { PluginWrapper } from '../plugin-wrapper';
import { Dependencies, DetailedDependency } from '../../zupa';

type Dep = {
	packageName: string;
	version: string;
	source: PluginWrapper;
	registry?: string;
	alias: string;
}
type DepsRegistry = Dep[];

export class PackageManager {

	constructor(
		protected npmManager = new NpmManager(),
		protected readonly dependencies: DepsRegistry = []
	) {}

	registerDependencies(dependencyList: Dependencies, source: PluginWrapper) {

		for (const dep of dependencyList) {
			if (typeof dep === 'string') {

				const parts = dep.split('@')
				const packageName = parts[0];
				const version = parts[1];

				this.addDep({
					packageName,
					version,
				}, source)
			}
			else {
				this.addDep(dep, source)
			}
		}
	}

	addDep(dep: DetailedDependency, source: PluginWrapper) {

		const depFootPrint = `${dep.packageName}${source.pluginAccess}`;
		const hash = CryptoJS.MD5(depFootPrint)
		const base64Hash = hash.toString();
		const alias = `${dep.packageName}-${base64Hash}`

		const registered = {
			alias,
			packageName: dep.packageName,
			version: dep.version,
			registry: dep.registry,
			source
		};

		//console.log('Registered dependency', { p: registered.packageName, v: registered.version })

		this.dependencies.push(registered)
	}

	findPackage(packageName: string, source: PluginWrapper) {
		const npmPackage = this.dependencies.find(dep => {
			return dep.packageName === packageName && dep.source === source;
		})

		if (!npmPackage) {
			throw new Error(`Cannot find package: ${packageName} in ${source.pluginAccess}`)
		}

		return npmPackage;
	}

	async installDependencies() {

		const depsByRegistry = groupBy(this.dependencies, dep => dep.registry || '')


		for (let [registry, deps] of Object.entries(depsByRegistry)) {

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
}