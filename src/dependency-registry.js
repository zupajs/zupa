const { log } = require('./logging')
const chalk = require('chalk')
const { createRequire, } = require('module')

const logColor = chalk.green;
const logIcon = '📦';

const DepType = {
	projectDep: 'projectDep',
	dep: 'dep',
	devDep: 'devDep'
};

const MatchType = {
	notInstalled: 0,
	versionMismatch: 1,
	installed: 2
}

function createDependencyRegistry(__dirname, __filename, project) {

	const registry = {
		deps: []
	};

	let packageManager = null;

	function getPackageManager() {
		if (packageManager === null) {
			throw new Error('Package manager is not set. Please define one.')
		}
		return packageManager;
	}

	const projectRequire = createRequire(__filename);

	const addDep = (npmPackage, type) => {
		const source = project.activePlugin && project.activePlugin.path;

		if (!source) {
			throw new Error(`Loading dependency ${npmPackage} outside of a plugin`)
		}

		log(logColor(`${logIcon} dependency '${type}' from ${source}`), npmPackage);

		let version = '';
		let packageName = npmPackage;

		if (packageName.includes('@')) {
			const parts = packageName.split('@')
			packageName = parts[0]
			version = parts[1]
		}

		registry.deps.push({ packageName, version, type, source })
	}

	const getDeps = (type, normalize = true) => {
		let filtered = registry.deps.filter(dep => dep.type === type);
		if (!normalize) {
			return filtered;
		}
		return filtered.map(dep => {
			const packageName = dep.packageName;
			const version = '@' + dep.version;

			return `${packageName}${version}`
		});
	};

	async function checkUnversionedDeps(deps) {
		const unversionedDeps = deps.map(dep => {
			const parts = dep.split('@')
			return {
				packageName: parts[0],
				version: parts[1],
			}
		}).filter(dep => {
			return dep.version === ''
		});

		if (unversionedDeps.length > 0) {

			const suggestions = [];

			for (let dep of unversionedDeps) {
				const versions = await getPackageManager().getAvailableVersions(dep.packageName)
				const version = versions[versions.length - 1]

				suggestions.push(`${dep.packageName}@${version}`)
			}

			log(chalk.red(`
Missing versions for npm packages.
Latest versions of packages:
\t${suggestions.join('\n\t')}
			`))
			process.exit(2)
		}
	}

	function matchInstalledVersion(dep) {
		const parts = dep.split('@')
		const packageName = parts[0]
		const version = parts[1]

		try {
			const pkgJson = projectRequire(`${packageName}/package.json`);

			const versionMatch = version === pkgJson.version;

			return versionMatch ? {
				match: MatchType.installed
			} : {
				match: MatchType.versionMismatch,
				data: {
					expected: version,
					installed: pkgJson.version
				}
			}
		}
		catch (e) {
			if (e.code === 'MODULE_NOT_FOUND') {
				return { match: MatchType.notInstalled }
			}
			throw new Error(`Cannot recognize state of dependency: ${packageName}. ${e}`)
		}
	}

	const installDeps = async (desiredDeps) => {

		await checkUnversionedDeps(desiredDeps);

		log(logColor(`${logIcon} Propagate installing project dependencies: ${desiredDeps.join(', ')}`));

		const deps = desiredDeps.filter(dep => {
			const versionMatch = matchInstalledVersion(dep);

			if (versionMatch.match === MatchType.installed) {
				log(logColor(`${dep} is already installed. Skip install`))
				return false;
			}
			else if (versionMatch.match === MatchType.versionMismatch) {
				log(chalk.yellow(
					`WARN: ${dep} is already installed, but has other version than expected. 
					Expected: ${versionMatch.data.expected}, installed: ${versionMatch.data.installed}`
				));
			}
			return true;
		})

		if (deps.length === 0) {
			log(logColor('Nothing to install. Everything is up to date'))
			return;
		}

		// install
		await getPackageManager().install(deps)
	}

	const controller = {
		async installProjectDeps() {
			const deps = getDeps(DepType.projectDep)
			await installDeps(deps)
		},

		async addDepsToPackageJson(pkg) {
			await checkUnversionedDeps([
				...getDeps(DepType.devDep),
				...getDeps(DepType.projectDep),
				...getDeps(DepType.dep)]
			)

			const devDeps = getDeps(DepType.devDep, false);
			const projectDeps = getDeps(DepType.projectDep, false);

			pkg.devDependencies = [...projectDeps, ...devDeps].reduce((obj, item) => {
				obj[item.packageName] = item.version;
				return obj;
			}, {});

			const deps = getDeps(DepType.dep, false);
			pkg.dependencies = deps.reduce((obj, item) => {
				obj[item.packageName] = item.version;
				return obj;
			}, {});
		},

		async installDeps() {
			const deps = getDeps(DepType.dep)
			const devDeps = getDeps(DepType.devDep)

			await installDeps([...deps, ...devDeps])
		}
	};

	project.events.on('prepare:after', async () => {
		await controller.installProjectDeps();
	})

	return {
		registry,
		controller,
		setPackageManager: function (pm) {
			log(logColor(`Registering package manager: ${pm}`))
			packageManager = pm;
		},
		prepareApi: {
			projectDep(npmPackage) {
				addDep(npmPackage, DepType.projectDep)
			}
		},
		defineApi: {
			dep(npmPackage) {
				addDep(npmPackage, DepType.dep)
			},

			devDep(npmPackage) {
				addDep(npmPackage, DepType.devDep)
			}
		}
	}
}

module.exports = {
	createDependencyRegistry
}