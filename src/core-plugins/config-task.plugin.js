project(({
	tasks, config
}) => {

	tasks($ => {
		$('config').handle(() => {

			return config;

		})
	})

})