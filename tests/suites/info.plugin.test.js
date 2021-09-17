const test = require("ava");
const setup = require("../common/setup");

test('project.js is loaded and has info tasks', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./project.js': ``
	})

	const res = await zupa(['info'])

	t.is(res.exitCode, 0);
})