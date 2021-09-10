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
		welcome: (say ='sub') => {
			const yosay = require('yosay')

			return yosay(say)
		}
	}
})