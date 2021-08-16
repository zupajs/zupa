import { resolve } from "path";

export function createPreparer(projectObject, __dirname, loadPlugin) {
	let prepareBuilder = null;

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

					await loadPlugin(pluginPath, projectObject)
				};

				await prepareBuilder({
					plugin,
					...projectObject.dependencyRegistry.prepareApi
				})
			}
		}
	}
}
