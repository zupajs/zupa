/// <reference type="../../zupd.d.ts" />

prepare(async ({ projectDep, params }) => {
	await projectDep('cowsay@' + params.cowsayVersion)
})

define(async ({ $, require, params }) => {

	$`sayHi`({
		async run(args) {
			let message = args;
			if (message.length === 0) {
				message = [params.defaultText]
				// throw new Error("🐮 please define something to cow")
			}

			const cowsay = require('cowsay');

			return cowsay.say({
				text: message.join(' ')
			});
		}
	})

})