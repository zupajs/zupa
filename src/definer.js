const { createRequire } = require('module')

function createDefiner(project) {
	const { log } = project;

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

				const require = createRequire(project.__filename);

				await defineBuilder({
					pkg: project.pkg,
					project: project,
					config: project.config,
					require,
					log,
					...project.scriptRegistry.api,
					...project.dependencyRegistry.defineApi
				});
			}
		}
	}
}

module.exports = {
	createDefiner
}
