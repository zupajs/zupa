project(({
	dependencies,
	require,
	options
}) => {

	dependencies([
		'cowsay@1.4.0',
		`yosay@${options.versions.yosay}`
	])

	return {
		welcome: () => {
			const yosay = require('yosay')

			return yosay('sub')
		}
	}
})