const { updatePackageJson } = require('../package-json');
const { groupBy } = require('lodash')

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

	script(depsScriptName, async argv =>
		await script.route(argv, {
			async clear(argv) {
				const rimraf = require('rimraf')
				const { resolve } = require('path')

				const node_modules_path = resolve(project.__dirname, 'node_modules');

				log.info(`rm -rf ${node_modules_path}`)

				rimraf.sync(node_modules_path)
			},

			async list() {
				let deps = project.dependencyRegistry.registry.deps;

				const grouppedDeps = groupBy(deps, 'type')
				return grouppedDeps

				// TODO 19-Aug-2021/zslengyel: decide what output format would be sufficient
				//const depsMessage = Object.keys(grouppedDeps).map(group => {
				//	const gDeps = grouppedDeps[group];
				//
				//	return {
				//		group,
				//		deps: gDeps.map(dep => {
				//			const source = shortenPath(__zupaDirname, shortenPath(project.__dirname, dep.source, '~'), '@zupa');
				//			return `${dep.packageName}@${dep.version} from ${source}`;
				//		})
				//	}
				//})
				//
				//return depsMessage
			},

			async default(argv) {
				const depsController = project.dependencyRegistry.controller;

				await depsController.addDepsToPackageJson(pkg)

				await depsController.installDeps();

				return `✅️ Packages are up-to-date`
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

		}))
})