const { resolve } = require('path');
const { createRequire } = require("module");

function createPreparer(project, __dirname, loadPlugin) {
	let prepareBuilder = null;

	// array of promises
	const pluginLoads = [];

	return {
		prepare: function (cb) {
			prepareBuilder = cb;
		},
		controller: {
			async run(params = {}) {
				if (prepareBuilder === null) {
					return;
				}

				const plugin = async (path, pluginParams) => {
					// TODO support more
					const pluginPath = resolve(__dirname, path)

					const pluginLoading = loadPlugin(pluginPath, project, pluginParams);
					// avoid accidental missing await on caller side
					pluginLoads.push(pluginLoading);

					await pluginLoading
				};

				const require = createRequire(project.__filename);

				await prepareBuilder({
					require,
					plugin,
					...project.dependencyRegistry.prepareApi,
					...project,
					project,
					params
				})

				await Promise.all(pluginLoads)
			}
		}
	}
}

module.exports = {
	createPreparer
}