const merge = require('deepmerge')

const defaultConfig = {
	scripts: {
		default: ''
	}
}

function createConfig(argv) {
	// TODO 17-Aug-2021/zslengyel: handle argv

	let config = {
		...defaultConfig
	};

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