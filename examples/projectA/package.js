prepare(async ({ projectDep, plugin }) => {

	//config.patch({
	//
	//})

	await plugin('./plugins')
})

define(async ({ pkg, dep, devDep }) => {
	pkg.version = '1.0.1';
	pkg.license = 'MIT';
	pkg.author = 'pajy';

	dep('lodash-es@4.17.21');
	devDep('momentjs@2.0.0')

})