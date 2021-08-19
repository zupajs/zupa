define(({ config, script }) => {

	script('config', async (argv) => {

		return await script.route(argv, {
			async default(argv) {

				if (argv.short) {
					return 'TODO short'
				}
				return config.get()
			}
		})

	})

})