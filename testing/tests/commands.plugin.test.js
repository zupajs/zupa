const test = require('ava')
const setup = require('../setup')

// TODO 30-Aug-2021/zslengyel: commands is not implemented yet
test.skip('commands command is defined', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': ``
	})

	const res = await zupa(['commands'])

	t.is(res.stdout, "");
})

test('commands list command is defined', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': ``
	})

	const res = await zupa(['commands', 'list'])

	t.truthy(res.stdout.length > 0, "return not empty result");
})
