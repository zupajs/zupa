const { lstatSync, existsSync } = require("fs");
const { resolve } = require("path");
const { __zupaDirname } = require('./zupa-dir')

function shortenZupaPath(path) {
	return path.replace(__zupaDirname, '@zupa');
}

function shortenPath(baseDir, projectPath, replace = '') {
	let shortProjectPath = projectPath.replace(baseDir, replace);
	return shortenZupaPath(shortProjectPath)
}

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

module.exports = {
	normalizePluginPath,
	shortenPath
}