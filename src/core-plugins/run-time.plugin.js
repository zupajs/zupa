
prepare(({ project, log }) => {

	const logStyle = chalk.magentaBright.underline.bold;
	project.on('run:before', () => {
		project.runStartTime = new Date().getTime()
		log(logStyle('Prepare to run'))
	})

	project.on('run:after', () => {
		log(logStyle(`Finally done in ${new Date().getTime() - project.runStartTime}ms`))
	})
})