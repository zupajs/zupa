import execa from "execa";
import { log } from './logging.mjs'
import chalk from "chalk";

const logColor = chalk.green;

const DEP_TYPES = {
	projectDep: 'projectDep',
	dep: 'dep',
	devDep: 'devDep'
}

export function createDependencyRegistry(__dirname, events) {

	const registry = {
		deps: []
	}

	const addDep = async (npmPackage, type) => {
		log(logColor(`Adding package to dependencies ${type}`), npmPackage);

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

	const VERSION_MATCH = {
		notInstalled: 0,
		versionMismatch: 1,
		installed: 2
	}

	function matchInstalledVersion(dep) {
		const parts = dep.split('@')
		const packageName = parts[0]
		const version = parts[1]

		try {
			const pkgJson = require(`${packageName}/package.json`);

			const versionMatch = version === pkgJson.version;

			return versionMatch ? {
				match: VERSION_MATCH.installed
			} : {
				match: VERSION_MATCH.versionMismatch,
				data: {
					expected: version,
					installed: pkgJson.version
				}
			}
		}
		catch (e) {
			if (e.code === 'MODULE_NOT_FOUND') {
				return { match: VERSION_MATCH.notInstalled }
			}
		}
	}

	const installDeps = async (desiredDeps, save = '--save-dev') => {

		const deps = desiredDeps.filter(dep => {
			const versionMatch = matchInstalledVersion(dep);

			if (versionMatch.match === VERSION_MATCH.installed) {
				log(logColor(`${dep} is already installed. Skip install`))
				return false;
			}
			else if (versionMatch.match === VERSION_MATCH.versionMismatch) {
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

		const npmArgs = ['install', '--color=always', '--json=true', save, ...deps];
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
			call.stdout.pipe(process.stdout);
		}

		await call;
	}

	let controller = {
		async installProjectDeps() {
			const deps = getDeps(DEP_TYPES.projectDep)
			await checkUnversionedDeps(deps);

			log(logColor(`Propagate installing project dependencies: ${deps.join(', ')}`));

			await installDeps(deps, '--save-dev')
		},

		async addDepsToPackageJson(pkg) {
			await checkUnversionedDeps([
				...getDeps(DEP_TYPES.devDep),
				...getDeps(DEP_TYPES.projectDep),
				...getDeps(DEP_TYPES.dep)]
			)

			const devDeps = getDeps(DEP_TYPES.devDep, false);
			const projectDeps = getDeps(DEP_TYPES.projectDep, false);

			pkg.devDependencies = [...projectDeps, ...devDeps].reduce((obj, item) => {
				obj[item.packageName] = item.version;
				return obj;
			}, {});

			pkg.dependencies = getDeps(DEP_TYPES.dep, false).reduce((obj, item) => {
				obj[item.packageName] = item.version;
				return obj;
			}, {});
		},

		async installDeps() {
			const deps = getDeps(DEP_TYPES.dep)
			log(logColor('Installing package.json dependencies'), deps)

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
				addDep(npmPackage, DEP_TYPES.projectDep)
			}
		},
		defineApi: {
			dep(npmPackage) {
				addDep(npmPackage, DEP_TYPES.dep)
			},

			devDep(npmPackage) {
				addDep(npmPackage, DEP_TYPES.devDep)
			}
		}
	}
}