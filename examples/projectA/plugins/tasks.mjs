define(({ script }) => {

	script('echo', (msg) => {
		console.log(chalk.bgMagenta.green(msg))
	})

})