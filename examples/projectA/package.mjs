prepare(async ({ projectDep, plugin }) => {
	await projectDep('cowsay@1.5.0')
	await plugin('./plugins')
})

define(async ({ pkg, dep, devDep, script }) => {
	pkg.version = '1.0.1';
	pkg.license = 'MIT';
	pkg.author = 'pajy';

	dep('lodash-es@4.17.21');
	devDep('momentjs@2.0.0')

	script('sayHi', async (...message) => {

		const cowsay = require('cowsay');

		console.log(cowsay.say({
			text: message.join(' ')
		}));
	});

})