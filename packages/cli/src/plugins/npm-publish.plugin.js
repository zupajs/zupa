project(({
	tasks,
	project,
	dependencies,
	options
}) => {

	dependencies([
		'chalk@4.1.2'
	])

	tasks(task => {

		task('npm:publish')
			.handle(() => {
				const dependencies = project.packageManager.dependencies;

				const out = dependencies.map(dep => {
					return `${dep.packageName}@${dep.version} at ${dep.source}`
				}).join('\n')

				return out;
			})


	})
})