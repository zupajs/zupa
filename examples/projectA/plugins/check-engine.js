
prepare(async ({ projectDep, plugin }) => {
	projectDep('check-engines@1.5.0')
})

define(({ project, log }) => {

	project.on('prepare:after', async () => {
		const checkEngines = require('check-engines');

		await new Promise((res, rej) => checkEngines({
			engines: {
				node: '14'
			}
		}, (err, info) => {
			if (err) {
				log(chalk.red(err.message))
				process.exit(1)
			}
			res();
		}))
	});
})
