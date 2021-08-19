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

function createConfig(argv) {
	// TODO 17-Aug-2021/zslengyel: handle argv

	let config = rc('zupa', defaultConfig)

	return {
		get() {
			return config;
		},
		patch(partialConfig) {
			config = merge(config, partialConfig);
		}
	}
}

module.exports = {
	createConfig
}