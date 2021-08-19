const { dirname, resolve } = require('path')
const chalk = require('chalk')
const { createPreparer } = require('./preparer')
const { createDefiner } = require('./definer')
const { __zupaDirname } = require('./zupa-dir')
const { shortenPath, normalizePluginPath } = require("./paths");

const logColor = chalk.blueBright

async function loadPlugin(originalPluginPath, project, isRootPlugin = false) {

	const { log } = project;

	const pluginPath = normalizePluginPath(originalPluginPath);

	const __filename = resolve(pluginPath);
	const __dirname = dirname(pluginPath);

	log(logColor(`🔌 load plugin: ${shortenPath(project.__dirname, pluginPath)}`))

	let { prepare, controller: prepareController } = createPreparer(project, __dirname, loadPlugin);

	let { define, controller: defineController } = createDefiner(project);

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
	});

	await import(pluginPath)

	async function pluginActivation(cb) {
		project.activePlugin = {
			path: pluginPath
		};

		await cb()

		project.activePlugin = null;
	}

	await pluginActivation(async () => await prepareController.run());

	project.on('prepare:after', async () => {
		await pluginActivation(async () => await defineController.run());
	})
}

module.exports = {
	loadPlugin
}

