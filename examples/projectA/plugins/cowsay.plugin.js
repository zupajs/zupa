/// <reference type="../../zupd.d.ts" />

prepare(async ({ projectDep, params }) => {
	await projectDep('cowsay@' + params.cowsayVersion)
})

define(async ({ script, require, params }) => {

	script('sayHi', async (argv) => {

		let message = argv['_'];
		if (message.length === 0) {
			message = [params.defaultText]
			// throw new Error("🐮 please define something to cow")
		}

		const cowsay = require('cowsay');

		return cowsay.say({
			text: message.join(' ')
		});
	});

})