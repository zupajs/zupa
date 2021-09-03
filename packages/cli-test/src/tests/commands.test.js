const test = require('ava')
const setup = require('../common/setup')

test('user can define command with $', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': `
			define( ({$}) => {
				
				$\`meow\`({
					run() {
						return 'meow'
					}
				})
			
			})
		`
	})

	const res = await zupa(['meow'])

	t.is(res.stdout, "meow");
})


test('user can define command with $.is', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': `
			define( ({$}) => {
				
				$\`meow\`.is('echo', ['cat'])
			})
		`
	})

	const res = await zupa(['meow'])

	t.is(res.stdout, "cat");
})


test('user can define named argument', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': `
			define( ({$}) => {
				
				$\`meow <name>\`({
					run(args) {
						return 'meow ' + args.name;
					}
				})
			
			})
		`
	})

	const res = await zupa(['meow', 'cat'])

	t.is(res.stdout, "meow cat");
})


test('user can define any number of arguments', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': `
			define( ({$}) => {
				
				$\`meow <name> <age> <home>\`({
					run(args) {
						return 'meow ' + args.name + ' ' + args.age + ' ' + args.home;
					}
				})
			
			})
		`
	})

	const res = await zupa(['meow', 'cat', '1', 'House'])

	t.is(res.stdout, "meow cat 1 House");
})

test('user can pass options to command', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': `
			define( ({$}) => {
				
				$\`meow\`({
					run(args, options) {
						return 'meow ' + options.name;
					}
				})
			
			})
		`
	})

	const res = await zupa(['meow', '--name=cat'])

	t.is(res.stdout, "meow cat");
})


test('user cannot override command', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': `
			define( ({$}) => {
				
				$\`meow\`({
					run(args, options) {
						return 'meow ' + options.name;
					}
				});
				
				$\`meow\`({
					run(args, options) {}
				})
			
			})
		`
	})

	await t.throwsAsync(async () => {
		return await zupa()
	}, { instanceOf: Error });
})