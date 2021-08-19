const merge = require('deepmerge')
const rc = require('rc')

const defaultConfig = {
	scripts: {
		default: ''
	},
	deps: {
		removePackageJson: true
	}
}

function createConfig() {

	let config = rc('zupa', defaultConfig)

	return {
		get() {
			return { ...config };
		},
		patch(partialConfig) {
			config = merge(config, partialConfig);
		}
	}
}

module.exports = {
	createConfig
}