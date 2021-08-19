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
					require,
					...project.scriptRegistry.api,
					...project.dependencyRegistry.defineApi,
					...project,
					project
				});
			}
		}
	}
}

module.exports = {
	createDefiner
}
