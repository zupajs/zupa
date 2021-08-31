import { define, prepare } from '../../packages/core';

prepare(async ({ plugin, config }) => {

	config.patch({
		deps: {
			removePackageJson: true
		}
	})

	await plugin('./plugins', {
		cowsayVersion: '1.5.0'
	})
})

define(async ({ pkg, dep, devDep, $ }) => {
	pkg.name = 'projectA';
	pkg.version = '1.0.1';
	pkg.license = 'MIT';
	pkg.author = 'zupa';

	dep('lodash-es@4.17.21');
	dep('jquery@3.6.0');
	devDep('momentjs@2.0.0')

	const build = $`build`({
		args: {
			arg: {}
		},
		options: {
			verbose: {
				alias: 'v',
				required: true
			}
		},
		async run() {
			return 'Fooo'
		}
	})

	build.$`myapp`({})

	$`meow <name>`({
		run(args) {
			return 'meow ' + args.name
		}
	})

	$`test`.is('ava')

})