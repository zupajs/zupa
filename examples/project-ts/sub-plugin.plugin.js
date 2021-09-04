project(({
	dependencies,
	commands
}) => {

	dependencies([
		'cowsay@1.4.0',
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
})