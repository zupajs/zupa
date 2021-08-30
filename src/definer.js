const { createRequire } = require('module')

function createDefiner(project) {

	let defineBuilder = null;

	return {
		define: function (builder) {
			defineBuilder = builder;
		},
		controller: {
			async run(params = {}) {
				if (defineBuilder === null) {
					return;
				}

				const require = createRequire(project.__filename);

				await defineBuilder({
					require,
					...project.dependencyRegistry.defineApi,
					...project,
					$: project.commands.subcommand,
					project,
					params
				});
			}
		}
	}
}

module.exports = {
	createDefiner
}
