prepare(async ({ projectDep, plugin }) => {
	await projectDep('cowsay@1.5.0')
})


define(async ({ script, require }) => {
	script('sayHi', async (...message) => {

		if (message.length === 0) {
			throw new Error("🐮 please define something to cow")
		}
		const cowsay = require('cowsay');

		console.log(cowsay.say({
			text: message.join(' ')
		}));
	});

})