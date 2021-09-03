exports.default = class extends ZupaPlugin {

	dependencies = [
		'cowsay@1.5.0',
		'lodash@4.17.21',
		{ packageName: 'jquery', version: '3.6.0', registry: 'https://registry.npmjs.org' }
	];

	plugins = [
		'./sub-plugin.plugin.js'
	]

	commands(prog, {
		result
	}) {

		prog
			.command('moo')
			.description('Say moo')
			.action(async () => {

				const cowsay = this.require('cowsay')
				console.log(cowsay.say({
					text : "I'm a moooodule",
					e : "oO",
					T : "U "
				}));

				result('hu');
			})

	}

}