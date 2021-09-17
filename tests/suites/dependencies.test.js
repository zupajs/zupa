const test = require('ava');
const setup = require('../common/setup');

test('empty project without node_modules installs', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./project.js': ``
	})

	const res = await zupa()

	t.is(res.exitCode, 0);
})

test('empty project with empty node_modules installs', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'node_modules': {},
		'./project.js': ``
	})

	const res = await zupa()

	t.is(res.exitCode, 0);
})