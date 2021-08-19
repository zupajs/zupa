const { lstatSync, existsSync } = require("fs");
const { resolve } = require("path");

function shortenPath(baseDir, projectPath, replace = '') {
	return projectPath.replace(baseDir, replace)
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