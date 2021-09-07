project(({
	dependencies,
	plugins,
	tasks,
	require,
	project,
	logger
}) => {

	dependencies([
		'cowsay@1.5.0',
		'lodash@4.17.21',
		{ packageName: 'jquery', version: '3.6.0', registry: 'https://registry.npmjs.org', noalias: true }
	])

	plugins([
		['./sub-plugin.plugin.js', {
			id: 'sub-plugin',
			versions: {
				yosay: '2.0.2'
			}
		}]
	])

	tasks(task => {

		task('yoo').configure(() => {

			const subPl = require('plugin://sub-plugin')

			return subPl.welcome()

		})

		task('moo')
			.configure(() => {

				const cowsay = require('cowsay')
				return cowsay.say({
					text: "I'm a moooodule",
					e: "oO",
					T: "U "
				});
			})

	})

})