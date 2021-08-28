define(({ config, log, script }) => {

	script('config', async (argv) => {

		return await script.route(argv, {
			get(argv) {
				const configName = argv._
				if (configName.length !== 1) {
					throw new Error('Please define one and only one config param to get')
				}
				return config.get()[configName[0]]
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