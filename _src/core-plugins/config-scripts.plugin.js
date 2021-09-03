prepare(({ projectDep }) => {
	projectDep('jsonpath-plus@6.0.1')
})

define(({ config, $ }) => {

	$`config`({
		run(argv, options) {
			if (options.short) {
				return 'TODO short'
			}
			return config.get()
		}
	})
	.$`get <expression>`({
		args: {
		},
		run(args) {
			const { expression } = args;

			const { JSONPath } = require('jsonpath-plus');

			return JSONPath({
				path: expression,
				json: config.get(),
				wrap: false,
			})
		}
	})

})