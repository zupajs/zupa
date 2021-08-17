prepare(({ project, log }) => {

	project.on('run:before', () => {
		project.runStartTime = new Date().getTime()
		log(chalk.red.underline.bold('Prepare to run'))
	})

	project.on('run:after', () => {
		log(chalk.red.underline.bold(`Finally done in ${new Date().getTime() - project.runStartTime}ms`))
	})
})