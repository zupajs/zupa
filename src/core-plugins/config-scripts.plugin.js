prepare(({ projectDep }) => {

	projectDep('jsonpath-plus@6.0.1')
})

define(({ config, log, script }) => {

	script('config', async (argv) => {

		return await script.route(argv, {
			get(argv) {


				const configName = argv._
				if (configName.length !== 1) {
					throw new Error('Please define one and only one config param to get')
				}

				const {JSONPath} = require('jsonpath-plus');
				return JSONPath({
					path: configName[0],
					json: config.get()
				})

			},

			async default(argv) {

				if (argv.short) {
					return 'TODO short'
				}
				return config.get()
			}
		})

	})

})