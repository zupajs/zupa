
prepare(({ project, log }) => {

	project.on('run:before', () => {
		project.runStartTime = new Date().getTime()
		log('Prepare to run')
	})

	project.on('run:after', () => {
		log(`Finally done in ${new Date().getTime() - project.runStartTime}ms`)
	})
})