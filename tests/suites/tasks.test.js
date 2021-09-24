const test = require('ava');
const setup = require('../common/setup');

test('task name is validated against white spaces', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./project.js': `
		project(({ tasks, dependencies, require }) => {
	
			tasks($ => {
				$('foo bar').handle(() => {
					return 0;
				})
			})
		})
		`
	})

	try {
		await zupa()
		t.fail('should fail')
	}
	catch (error) {

		t.is(error.exitCode, 1);
		t.regex(error.stdout, /Task name must match regexp:/, 'Task name error');
		t.regex(error.stdout, /foo bar/, 'Task name error');
	}
})

test('tasks registry supports inline handler', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./project.js': `
		project(({ tasks }) => {
	
			tasks($ => {
				$('foo', () => 'bar');
			})
		})
		`
	});

	const res = await zupa(['foo'])

	t.is(res.exitCode, 0)
	t.is(res.stdout, 'bar');

});