#!/usr/bin/env node

import fs from 'fs';
import { dirname, resolve } from 'path'
import minimist from 'minimist'
import { createRequire } from 'module'
import url from 'url'
import execa from 'execa'

export const argv = minimist(process.argv.slice(2))

function log(...args) {
	if (argv.verbose) {
		console.log(...args)
	}
}

let defaultPackageFile = './package.mjs';

if (fs.existsSync(defaultPackageFile)) {

	const filepath = resolve(defaultPackageFile)
	await importPath(filepath)

}

function resolvePackageJsonPath(__dirname) {
	return resolve(__dirname, 'package.json');
}

async function loadPackageJson(__dirname) {
	const packagePath = resolvePackageJsonPath(__dirname);

	if (fs.existsSync(packagePath)) {
		return JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
	}

	return {};
}

function createConfigure(__dirname) {
	const defaultConfigureBuilder = async () => {
	};
	let configureBuilder = defaultConfigureBuilder;


	return {
		configure: function (cb) {
			configureBuilder = cb;
		},
		controller: {
			async run() {
				if (configureBuilder === null) {
					throw new Error('you should provide a callback in configure() function.')
				}

				const buildDep = async function (dependency, type = 'dev') {
					log('Loading builddep', dependency);

					await execa(
						'npm',
						['install', dependency, type == 'dev' ? '--save-dev' : '--save'],
						{ preferLocal: true }
					).stdout.pipe(process.stdout);
				};

				await configureBuilder({
					buildDep
				})
			}
		}
	}
}

function createProject(__dirname) {

	const defaultProjectBuilder = async () => {
	};
	let projectBuilder = defaultProjectBuilder;

	return {
		project: function (pb) {
			projectBuilder = pb;
		},
		controller: {
			async run() {
				if (projectBuilder === null) {
					throw new Error('you should provide a callback in project() function.')
				}

				const pkg = await loadPackageJson(__dirname);

				const addDep = async (npmPackage, target = 'dependencies') => {
					log(`Adding package to ${target}`, npmPackage)
					if (!pkg[target]) {
						pkg[target] = {};
					}

					let version = '';
					let packageName = npmPackage;

					if (packageName.includes('@')) {
						const parts = packageName.split('@')
						packageName = parts[0]
						version = parts[1]
					}

					if (version === '') {
						log('Finding version for', packageName);

						const versionsResult = await execa('npm', ['view', packageName, 'versions', '--json'], {
							preferLocal: true,
							cwd: __dirname
						});

						const versions = JSON.parse(versionsResult.stdout);

						version = '^' + versions[versions.length - 1]

						log('pick version', version)
					}

					pkg[target][packageName] = version;
				}

				const dep = async (npmPackage) => {
					await addDep(npmPackage, 'dependencies')
				};

				const devDep = async (npmPackage) => {
					await addDep(npmPackage, 'devDependencies')
				};

				const scriptRegistry = {};

				const script = async (name, scriptFn) => {
					scriptRegistry[name] = scriptFn
				}

				await projectBuilder({
					pkg, dep, devDep, script
				});

				return { pkg, scriptRegistry };
			}
		}
	}
}

async function initPackageJson(__dirname) {
	await execa('npm', ['init', '-y'], {
		cwd: __dirname
	})
}

async function updatePackageJson(pkg, __dirname) {

	const packageJsonPath = resolvePackageJsonPath(__dirname)
	log('Update', packageJsonPath)

	const pkgString = JSON.stringify(pkg, null, 4);
	fs.writeFileSync(packageJsonPath, pkgString, 'utf-8')
}

async function npmInstall(__dirname) {
	await execa('npm', ['install', '--color', 'always'], {
		preferLocal: true,
		cwd: __dirname
	}).stdout.pipe(process.stdout);
}

async function importPath(filepath, origin = filepath) {
	let __filename = resolve(origin)
	let __dirname = dirname(__filename)
	let require = createRequire(origin)

	let { configure, controller: configureController } = createConfigure(__dirname);
	let { project, controller: projectController } = createProject(__dirname);

	Object.assign(global, {
		__filename,
		__dirname,
		require,
		configure,
		project
	});

	await import(url.pathToFileURL(filepath))

	await initPackageJson(__dirname)
	await configureController.run();
	const { pkg, scriptRegistry } = await projectController.run();

	await updatePackageJson(pkg, __dirname);

	if (argv._.length > 0) {
		const script = argv._[0];

		let scriptFn = scriptRegistry[script];
		if (!scriptFn) {
			throw new Error(`script is not defined: ${script}`)
		}

		const params = argv._.splice(1)
		await scriptFn.apply(null, params)

	}
	else {

		await npmInstall(__dirname)
	}

}
