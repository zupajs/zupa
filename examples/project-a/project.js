project(({
	dependencies,
	plugins,
	commands,
	require,
	project
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

	commands((cmd, sub, result) => {

		cmd('yoo')
			.action(() => {

				const subPl = require('plugin://sub-plugin')

				console.log(subPl.welcome())

			})

		cmd('moo')
			.description('Say moo')
			.action(async () => {

				const cowsay = require('cowsay')
				console.log(cowsay.say({
					text : "I'm a moooodule",
					e : "oO",
					T : "U "
				}));

				result('hu');
			})

	})

})