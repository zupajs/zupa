const test = require('ava');
const setup = require("../common/setup");

test('package manager support scoped dependencies', async t => {
	const { project, zupa } = setup(t)

	project.volume({
		'./project.js': `
		project(({ tasks, dependencies, require }) => {
		
			dependencies([
				'@zupajs/zupa@0.0.3',
			])
		
			tasks($ => {
				$('foo').handle(() => {
					return require('@zupajs/zupa');
				})
			})
		})
		`
	})

	const res = await zupa(['foo', '--output', 'json'])

	t.is(res.exitCode, 0);
	t.is(res.stdout, JSON.stringify({ }));
})