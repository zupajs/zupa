project(({
	dependencies,
	plugins,
	tasks,
	require,
}) => {

	dependencies([
		'cowsay@1.5.0',
		'lodash@4.17.21',
		{ packageName: 'jquery', version: '3.6.0', registry: 'https://registry.npmjs.org', noalias: true }
	])

	plugins([
		['sub-plugin#./sub-plugin.plugin.js', {
			versions: {
				yosay: '2.0.2'
			}
		}],
		['npm-publish#@zupa/plugins/npm-publish.plugin.js', {}],
	])

	tasks(task => {

		const yoo = task('yoo').configure(() => {

			const subPl = require('sub-plugin')

			return subPl.welcome('1')

		})

		const yoo2 = task('yoo2').configure(() => {

			const subPl = require('sub-plugin')

			return subPl.welcome('2')

		}).dependsOn(yoo)


		task('moo')
			.configure((yooSay, yooSay2) => {

				const cowsay = require('cowsay')
				return yooSay + yooSay2 + cowsay.say({
					text: "I'm a moooodule",
					e: "oO",
					T: "U "
				});
			})
			.dependsOn(yoo, yoo2)

	})

})