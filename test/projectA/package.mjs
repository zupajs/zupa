configure(async ({ buildDep }) => {
	//await buildDep('cowsay@1.5.0')
})

project(async ({ pkg, dep, devDep, script }) => {

	pkg.version = '1.0.1';

	await dep('lodash-es');
	await devDep('momentjs')

	script('sayHi', async (message) => {

		const cowsay = require('cowsay');

		console.log(cowsay.say({
			text: message,
		}));
	});

})