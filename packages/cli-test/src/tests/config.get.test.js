const test = require('ava')
const setup = require('../common/setup')

test('config get command uses JSON path expressions', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./package.js': ``
	})

	const res = await zupa(['config', 'get', '$.customValue'], {
		env: {
			ZUPA_customValue: 'Hello'
		},
		extendEnv: true
	})

	t.is(res.stdout, "Hello");
})