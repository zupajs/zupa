define(({ script, chalk }) => {

	script('echo', (argv) => {
		return chalk.bgMagenta.green(argv['_'].toString())
	})

})