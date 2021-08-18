prepare(async ({ projectDep, plugin }) => {

	//config.patch({
	//
	//})

	await plugin('./plugins')
})

define(async ({ pkg, dep, devDep }) => {
	pkg.name = 'projectA';
	pkg.version = '1.0.1';
	pkg.license = 'MIT';
	pkg.author = 'zupa';

	dep('lodash-es@4.17.21');
	dep('jquery@3.6.0');
	devDep('momentjs@2.0.0')

})