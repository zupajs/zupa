const { dirname, resolve } = require('path')
const { log } = require('./logging')
const chalk = require('chalk')
const { createPreparer } = require('./preparer')
const { createDefiner } = require('./definer')
const { createProjectObject } = require('./project-object')
const { existsSync, lstatSync } = require('fs')
const { __zupaDirname } = require('./zupa-dir')
const { shortenPath } = require("./paths");

const logColor = chalk.blueBright

function normalizePluginPath(pluginPath) {
	if (lstatSync(pluginPath).isDirectory()) {

		const indexOptions = ['index.mjs', 'index.js'];
		let recommendedPluginPath = pluginPath;

		indexOptions.forEach(indexOption => {
			const option = resolve(pluginPath, indexOption);
			if (existsSync(option)) {
				recommendedPluginPath = option
			}
		})
		if (pluginPath === recommendedPluginPath) {
			throw new Error(`Cannot resolve plugin folder index file: ${pluginPath}`)
		}
		return recommendedPluginPath;
	}

	return pluginPath
}

async function loadPlugin(originalPluginPath, inheritedProjectObject = null) {

	const pluginPath = normalizePluginPath(originalPluginPath);


	const __filename = resolve(pluginPath);
	const __dirname = dirname(pluginPath);

	const isRootPlugin = inheritedProjectObject === null;
	let projectObject = inheritedProjectObject;

	if (isRootPlugin) {
		projectObject = await createProjectObject(__filename, __dirname)
	}

	log(logColor(`🔌 load plugin: ${shortenPath(projectObject.__dirname, pluginPath)}`))

	let { prepare, controller: prepareController } = createPreparer(projectObject, __dirname, loadPlugin);

	let { define, controller: defineController } = createDefiner(projectObject);

	if (isRootPlugin) {
		prepare(async ({ plugin }) => {
			const corePluginsPath = resolve(__zupaDirname, './core-plugins/index.js');
			await plugin(corePluginsPath)
		});
		await prepareController.run();
	}

	Object.assign(global, {
		__filename,
		__dirname,
		prepare,
		define,
		log,
		chalk
	});

	await import(pluginPath)

	async function pluginActivation(cb) {
		projectObject.activePlugin = {
			path: pluginPath
		};

		await cb()

		projectObject.activePlugin = null;
	}

	await pluginActivation(async () => await prepareController.run());

	// FIXME 18-Aug-2021/zslengyel: wrong place
	//await defineController.run()

	projectObject.on('prepare:after', async () => {
		await pluginActivation(async () => await defineController.run());
	})

	return projectObject;
}

module.exports = {
	loadPlugin
}

