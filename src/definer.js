const { log } = require('./logging');
const { createRequire } = require('module')

function createDefiner(projectObject) {
	let defineBuilder = null;

	return {
		define: function (builder) {
			defineBuilder = builder;
		},
		controller: {
			async run() {
				if (defineBuilder === null) {
					return;
				}

				const require = createRequire(projectObject.__filename);

				await defineBuilder({
					pkg: projectObject.pkg,
					project: projectObject,
					config: projectObject.config,
					require,
					log,
					...projectObject.scriptRegistry.api,
					...projectObject.dependencyRegistry.defineApi
				});
			}
		}
	}
}

module.exports = {
	createDefiner
}
