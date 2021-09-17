project(({ tasks, project }) => {

	tasks($ => {

		$('deps').handle(() => {
			return project.packageManager.dependencies
		}).preferOutputTransform('table')

	})

});