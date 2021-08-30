const test = require('ava')
const { resolve } = require('path')
const setup = require("../setup");

test('test project created', async t => {
	const { project } = setup(t)
	t.is(project.path, resolve(process.cwd(), 'test_projects/test_project_created_project'))
})

test('package.js is loaded', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./package.js': ``
	})

	const res = await zupa()

	t.is(res.exitCode, 0);
})

test('npm package is not installed in prepare due to missing version', async t => {
	const { project, zupa } = setup(t)
	project.volume({
		'./package.js': `
			prepare(({projectDep}) => {
				projectDep('lodash')
			})
		`
	})

	try {
		await zupa()
		t.fail('it should fail')
	}
	catch (e) {
		// TODO 19-Aug-2021/zslengyel: error should be on stderr
		t.pass(e.stdout.includes('Missing versions for npm packages.'));
		t.pass(e.stdout.includes('Latest versions of packages:'))
		t.pass(e.stdout.includes('lodash@'))
	}
})