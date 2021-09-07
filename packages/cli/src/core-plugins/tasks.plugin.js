project(({
	project,
	tasks
}) => {

	tasks(task => {

		task('tasks').configure(() => {

			let taskEntries = project.taskRegistry.tasks.entries();

			return Array.from(taskEntries).map(([taskName]) => {
				return taskName;
			})

		});
	})

})