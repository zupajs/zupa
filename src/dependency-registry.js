const execa = require('execa')
const { log } = require('./logging')
const chalk = require('chalk')
const { createRequire } = require('module')

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

function createDependencyRegistry(__dirname, __filename, events) {

	const registry = {
		deps: []
	}

	const projectRequire = createRequire(__filename);

	const addDep = (npmPackage, type) => {
		log(logColor(`${logIcon} dependency '${type}'`), npmPackage);

		let version = '';
		let packageName = npmPackage;

		if (packageName.includes('@')) {
			const parts = packageName.split('@')
			packageName = parts[0]
			version = parts[1]
		}

		registry.deps.push({ packageName, version, type })
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
				const versionsResult = await execa('npm', ['view', dep.packageName, 'versions', '--json'], {
					preferLocal: true,
					cwd: __dirname,
				});
				const versions = JSON.parse(versionsResult.stdout);
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

	const installDeps = async (desiredDeps, save = '--save-dev') => {

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

		const npmArgs = ['install', '--color=always', save, ...deps];
		log(logColor('npm ' + npmArgs.join(' ')))

		const call = execa(
			'npm',
			npmArgs,
			{
				preferLocal: true,
				cwd: __dirname,

			}
		);
		if (log.isVerbose) {
			call?.stdout?.pipe(process.stdout);
		}

		await call;
	}

	const controller = {
		async installProjectDeps() {
			const deps = getDeps(DepType.projectDep)
			await checkUnversionedDeps(deps);

			log(logColor(`${logIcon} Propagate installing project dependencies: ${deps.join(', ')}`));

			await installDeps(deps, '--save-dev')
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
			log(logColor('${logIcon} Installing package.json dependencies'), deps)

			await installDeps([], '')
		}
	};

	events.on('prepare:after', async () => {
		await controller.installProjectDeps();
	})

	return {
		registry,
		controller,
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