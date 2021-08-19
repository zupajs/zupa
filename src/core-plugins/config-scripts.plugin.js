define(({ config, script }) => {

	script('config', async (...params) => {

		return await script.route(params, {
			async default() {
				return config.get()
			}
		})

	})

})