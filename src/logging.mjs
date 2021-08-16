import minimist from "minimist";

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