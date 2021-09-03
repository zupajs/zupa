const test = require('ava')
const setup = require('../common/setup')

test('config command uses --short flag', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': ``
	})

	const res = await zupa(['config', '--short'])

	t.is(res.stdout, "TODO short");
})