project(({
	project,
	tasks
}) => {

	tasks(task => {

		task('tasks').configure(() => {

			const taskEntries = project.taskRegistry.tasks.entries();

			return Array.from(taskEntries).map(([taskName]) => {
				return taskName;
			})

		});
	})

})