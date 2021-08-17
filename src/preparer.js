const { resolve } = require('path');
const { createRequire } = require("module");
const { log } = require('./logging');

function createPreparer(projectObject, __dirname, loadPlugin) {
	let prepareBuilder = null;

	// array of promises
	const pluginLoads = [];

	return {
		prepare: function (cb) {
			prepareBuilder = cb;
		},
		controller: {
			async run() {
				if (prepareBuilder === null) {
					return;
				}

				const plugin = async (path) => {
					// TODO support more
					const pluginPath = resolve(__dirname, path)

					const pluginLoading = loadPlugin(pluginPath, projectObject);
					// avoid accidental missing await on caller side
					pluginLoads.push(pluginLoading);

					await pluginLoading
				};

				const require = createRequire(projectObject.__filename);

				await prepareBuilder({
					require,
					log,
					plugin,
					project: projectObject,
					...projectObject.dependencyRegistry.prepareApi
				})

				await Promise.all(pluginLoads)
			}
		}
	}
}

module.exports = {
	createPreparer
}