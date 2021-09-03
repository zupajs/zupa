const test = require('ava')
const setup = require('../common/setup')

test('output uses stderr on error', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': `
			define( ({$}) => {

				$\`meow\`({})

				$\`meow\`({})
			})
		`
	})

	try {
		await zupa(['meow'])
		t.fail('command should fail')
	}
	catch (e) {

		t.is(e.exitCode, 1);
		t.true(e.stderr.includes('Error: Command is already defined: meow'));
	}
})