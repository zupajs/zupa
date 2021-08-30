define(({ $, chalk }) => {

	$`echo`({
		run(argv) {
			return chalk.bgMagenta.green(argv['_'].toString())
		}
	})

})