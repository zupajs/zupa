const { updatePackageJson } = require('../package-json');
const { groupBy } = require('lodash')
const { shortenPath } = require('../paths')
const { __zupaDirname } = require("../zupa-dir");
const chalk = require('chalk')

prepare(({ projectDep }) => {
	projectDep('rimraf@3.0.2')
})

define(async ({ project, config, script, log, pkg }) => {

	const depsScriptName = 'deps';

	if (config.get().scripts.default === '') {
		// override if not defined
		config.patch({
			scripts: {
				default: depsScriptName
			}
		})
	}

	script(depsScriptName, async (...params) => {
		await script.route(params, {
			async clear(...params) {
				const rimraf = require('rimraf')
				const { resolve } = require('path')

				const node_modules_path = resolve(project.__dirname, 'node_modules');

				log.info(`rm -rf ${node_modules_path}`)

				rimraf.sync(node_modules_path)
			},

			async list() {
				let deps = project.dependencyRegistry.registry.deps;

				const grouppedDeps = groupBy(deps, 'type')

				const depsMessage = Object.keys(grouppedDeps).map(groupName => {
					const gDeps = grouppedDeps[groupName];

					return {
						name: groupName,
						deps: gDeps.map(dep => {
							const source = shortenPath(__zupaDirname, shortenPath(project.__dirname, dep.source, '~'), '@zupa');
							return `${chalk.green(`${dep.packageName}@${dep.version}`)} ${chalk.grey(`from ${source}`)}`;
						})
					}
				}).map(group => {
					return `${chalk.underline(group.name)}\n  ${group.deps.join('\n  ')}`
				}).join('\n')

				log.info(depsMessage)
			},

			async default(...params) {
				const depsController = project.dependencyRegistry.controller;

				await depsController.addDepsToPackageJson(pkg)

				await depsController.installDeps();

				log.info(`${chalk.green.bold('✅️')} Packages are up-to-date`)
			},

			async emitPackageJson() {
				config.patch({
					deps: {
						removePackageJson: false
					}
				});

				await project.dependencyRegistry.controller.addDepsToPackageJson(pkg)

				updatePackageJson(pkg, project.__dirname);
			}

		})


	})
})