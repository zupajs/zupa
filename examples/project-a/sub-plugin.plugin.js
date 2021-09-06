project(({
	dependencies,
	commands,
	require,
	options
}) => {

	dependencies([
		'cowsay@1.4.0',
		`yosay@${options.versions.yosay}`
	])

	//commands(prog, {
	//	result
	//}) {
	//
	//	prog
	//		.command('moo-sub')
	//		.description('Say moo sub')
	//		.option('--sub, -s <sub>')
	//		.action(async () => {
	//
	//			const cowsay = this.require('cowsay')
	//			console.log(cowsay.say({
	//				text: "sub moo",
	//			}));
	//		})
	//}

	return {
		welcome: () => {
			const yosay = require('yosay')

			return yosay('sub')
		}
	}
})