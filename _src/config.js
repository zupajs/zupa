const merge = require('deepmerge')
const rc = require('rc')

const defaultConfig = {
	commands: {
		default: ''
	},
	output: {
		forceTTYMode: false
	},
	deps: {
		removePackageJson: true
	}
}

function createConfig() {

	let minimist = require('minimist');
	const argv = minimist(process.argv.slice(2), {
		'--': true
	})

	const scriptArgv = minimist(argv['--'])

	let config = rc('zupa', defaultConfig, argv)

	return {
		get() {
			return { ...config };
		},
		scriptArgv() {
			return scriptArgv
		},
		patch(partialConfig) {
			config = merge(config, partialConfig);
		}
	}
}

module.exports = {
	createConfig
}