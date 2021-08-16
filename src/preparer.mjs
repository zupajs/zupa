import { resolve } from "path";

export function createPreparer(projectObject, __dirname, loadPlugin) {
	let prepareBuilder = null;

	// array of promises
	const pluginLoads = []

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

				await prepareBuilder({
					plugin,
					...projectObject.dependencyRegistry.prepareApi
				})

				log('Wait until all plugins are loaded')
				await Promise.all(pluginLoads)
			}
		}
	}
}
