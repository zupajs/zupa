prepare(({ projectDep }) => {
	projectDep('check-engines')
})

plugin( async ({ project }) => {

	project.on('before:load', async () => {
		const checkEngines = require('check-engines');

		await new Promise((res, rej) => checkEngines({
			engines: {
				node: '16'
			}
		}, (err, info) => {
			log(chalk.red(err.message))
			process.exit(1)
		}))
	});
})
