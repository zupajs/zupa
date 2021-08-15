prepare(async ({ projectDep, plugin }) => {
	await projectDep('cowsay@1.5.0')
	await plugin('./plugins/check-engine.mjs')
})

project(async ({ pkg, dep, devDep, script }) => {
	pkg.version = '1.0.1';
	pkg.license = 'MIT';
	pkg.author = 'pajy';

	await dep('lodash-es');
	await devDep('momentjs')

	script('sayHi', async (...message) => {

		const cowsay = require('cowsay');

		console.log(cowsay.say({
			text: message.join(' ')
		}));
	});

})