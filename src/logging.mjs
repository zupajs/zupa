import minimist from "minimist";
import chalk from 'chalk'

const argv = minimist(process.argv.slice(2))

export function log(...args) {
	if (argv.verbose) {
		console.log(...args)
	}
}

log.isVerbose = !!argv.verbose
log.info = (...args) => {
	console.log(...args)
}
log.error = (...args) => {
	console.error(...args.map(arg => chalk.red(arg)))
}