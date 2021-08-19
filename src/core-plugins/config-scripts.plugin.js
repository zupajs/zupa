define(({ config, script }) => {

	script('config', (...params) => {

		script.route(params, {
			async default() {

				log.info(config.get())

			}
		})

	})

})