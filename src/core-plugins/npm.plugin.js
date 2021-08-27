const chalk = require("chalk");
const fs = require('fs')
const { resolve } = require('path')
const npm = require('npm');
const { stripAnsi } = require('../common/strip-ansi.js')

const logColor = chalk.green;
const logIcon = '📦';

prepare(async ({ project, log, config }) => {

	if (!log.isVerbose) {
		// for npm calls
		process.argv = [...process.argv, '--silent']
	}


	const nodeModulesPath = resolve(project.__dirname, 'node_modules');
	if (!fs.existsSync(nodeModulesPath)) {
		fs.mkdirSync(nodeModulesPath)
	}

	const npmLoad = async () => {
		await new Promise((resLoad, rejLoad) => {
			npm.load(function (err) {
				// handle errors
				if (err) {
					rejLoad(err)
				}
				else {

					if (log.isVerbose) {
						npm.config.set('loglevel', 'notice')
					}
					else {
						npm.config.set('loglevel', 'silent')
					}

					resLoad()
				}
			})
		})
	}

	const npmInstall = async (deps) => {
		await new Promise((res, rej) => {
			npm.commands.install([...deps], function (err, data) {
				// log errors or data
				if (err) {
					rej(err)
				}
				else {
					res(data);
				}
			});
		})
	}

	const npmView = async (dep) => {
		return await new Promise((res, rej) => {
			const originalLog = console.log; // silly npm hack

			let cachetedConsoleLog = '';
			console.log = function (msg) {
				cachetedConsoleLog = msg
			}

			const originalNpmJson = npm.config.get('json')
			npm.config.set('json', true)

			npm.commands.view([dep, 'versions'], function (err) {
				// log errors or data
				if (err) {
					rej(err)
				}
				else {
					console.log = originalLog;
					npm.config.set('json', originalNpmJson)

					const versions = stripAnsi(cachetedConsoleLog);
					const versionsParsed = JSON.parse(versions);

					res(versionsParsed);
				}
			});
		})
	}

	await npmLoad()

	npm.on('log', message => {
		// log installation progress
		log(message);
	});

	const npmPackageManager = {
		async getAvailableVersions(packageName) {
			return await npmView(packageName)
		},

		async install(deps) {
			const npmArgs = ['install', '--color=always', ...deps];
			log(logColor(`${logIcon} npm ${npmArgs.join(' ')}`))

			await npmInstall(deps)
		},

		toString() {
			return 'npm'
		}
	};

	project.dependencyRegistry.setPackageManager(npmPackageManager)

	project.on('finally', () => {
		if (config.get().deps.removePackageJson) {
			const packageJsonPath = resolve(project.__dirname, 'package.json');
			if (fs.existsSync(packageJsonPath)) {
				log(`removing ${packageJsonPath}`)
				fs.rmSync(packageJsonPath)
			}
		}
	})
})