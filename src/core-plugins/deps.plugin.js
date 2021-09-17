project(({ dependencies, tasks, project, require }) => {

	dependencies([
	])

	tasks($ => {

		$('deps').handle(() => {

			return project.packageManager.dependencies
		}).preferOutputTransform('table')

	})

});