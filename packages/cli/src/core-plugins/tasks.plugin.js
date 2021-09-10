project(({
	project,
	tasks
}) => {

	tasks(task => {

		task('tasks').handle(() => {

			const taskEntries = project.taskRegistry.tasks.values();

			return Array.from(taskEntries).map( task => {
				return {
					name: task.name,
					desc: '',
					deps: Array.from(task.dependencies.values()).map(o => o.name).join(', ')
				};
			})

		}).preferOutputTransform('table');
	})

})