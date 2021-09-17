const test = require("ava");
const setup = require("../common/setup");

test('project enables config in project.js', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./project.js': `
			project(({ configure }) => {
				configure({
					random: 1
				})
			})
		`
	})

	const res = await zupa(['config', `--output raw`])

	t.is(res.exitCode, 0);

	const resultObj = JSON.parse(res.stdout);

	t.deepEqual(resultObj.tasks, {
		default: ''
	});
})